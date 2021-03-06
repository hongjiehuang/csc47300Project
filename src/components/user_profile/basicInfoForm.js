import React from 'react';
import {
    Button, Modal, Form, Input, Radio, Select, InputNumber, Icon, message
} from 'antd';
import Amplify, { Auth, Storage, API, graphqlOperation, I18n } from 'aws-amplify';
import * as mutations from '../../graphql/mutations';
import "../../style/userProfile.css";

let id = 0;

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const {
                visible, onCancel, onCreate, form, add, remove, userInfo,
            } = this.props;
            const { getFieldDecorator, getFieldValue } = form;
            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 4 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 20 },
                },
            };
            const formItemLayoutWithOutLabel = {
                wrapperCol: {
                    xs: { span: 24, offset: 0 },
                    sm: { span: 20, offset: 4 },
                },
            };
            getFieldDecorator('keys', { initialValue: userInfo.language ? userInfo.language:[]});
            const keys = getFieldValue('keys');
            const formItems = keys.map((k, index) => (
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? I18n.get('Languages') : ''}
                    required={false}
                    key={k}
                >
                    {getFieldDecorator(`languages[${k}]`)(
                        <Input placeholder={I18n.get("Language")} style={{ width: '60%', marginRight: 8 }} />
                    )}
                    {keys.length > 1 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            onClick={() => remove(k)}
                        />
                    ) : null}
                </Form.Item>
            ));

            return (
                <Modal
                    visible={visible}
                    title={I18n.get("Modify Basic Info")}
                    okText={I18n.get("Update")}
                    cancelText={I18n.get("Cancel")}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}>
                        <Form.Item label={I18n.get("First Name")}>
                            {getFieldDecorator('firstName', { initialValue: userInfo.firstName })(
                                <Input placeholder={userInfo.firstName}/>
                            )}
                        </Form.Item>

                        <Form.Item label={I18n.get("Middle Name")}>
                            {getFieldDecorator('middleName', { initialValue: userInfo.middleName })(
                                <Input placeholder={userInfo.middleName}/>
                            )}
                        </Form.Item>

                        <Form.Item label={I18n.get("Last Name")}>
                            {getFieldDecorator('lastName',{ initialValue: userInfo.lastName })(
                                <Input placeholder={userInfo.lastName}/>
                            )}
                        </Form.Item>

                        <Form.Item label={I18n.get("Age")}>
                            {getFieldDecorator('age', { initialValue: userInfo.age })(
                                <InputNumber min={15} max={100} />
                            )}
                        </Form.Item>

                        <Form.Item label={I18n.get("English Level")}>
                            {getFieldDecorator('englishLevel', { initialValue: userInfo.englishLevel })(
                                <Select
                                    placeholder="Select what best describe your english level">
                                    <Option value="Beginner">{I18n.get("Beginner")}</Option>
                                    <Option value="Elementary">{I18n.get("Elementary")}</Option>
                                    <Option value="Pre-intermediate">{I18n.get("Pre-intermediate")}</Option>
                                    <Option value="Intermediate">{I18n.get("Intermediate")}</Option>
                                    <Option value="Upper-intermediate">{I18n.get("Upper-intermediate")}</Option>
                                    <Option value="Advanced">{I18n.get("Advanced")}</Option>
                                </Select>
                            )}
                        </Form.Item>

                        {/* spoken langauge */}
                        {formItems}
                        <Form.Item label={I18n.get("Language")}>
                            <Button type="dashed" onClick={add} style={{ width: '60%' }}>
                                <Icon type="plus" /> {I18n.get("Add Language")}
                            </Button>
                        </Form.Item>
                        
                        {/* dont allow user to change the email account */}
                        {/* <Form.Item label="Email">
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid E-mail!',
                                }]
                            })(
                                <Input />
                            )}
                        </Form.Item> */}

                        <Form.Item label={I18n.get("Phone")}>
                            {getFieldDecorator('phone', { initialValue: userInfo.phone })(
                                <Input placeholder={userInfo.phone}/>
                            )}
                        </Form.Item>

                    </Form>
                </Modal>
            );
        }
    }
);

class BasicInfoForm extends React.Component {
    state = {
        visible: false,
        userInfo: this.props.userInfo
    };

    remove = (k) => {
        const { form } = this.formRef.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    add = () => {
        const { form } = this.formRef.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    }

    // handleSubmit = (e) => {
    //     e.preventDefault();
    //     this.props.form.validateFields((err, values) => {
    //         if (!err) {
    //             const { keys, names } = values;
    //             console.log('Received values of form: ', values);
    //             console.log('Merged values:', keys.map(key => names[key]));
    //         }
    //     });
    // }

    showModal = () => {
        this.setState({ visible: true });
    }

    handleCancel = () => {
        this.setState({ visible: false });
    }

    handleCreate = async() => {
        const form = this.formRef.props.form;
        form.validateFields(async(err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            const userId = this.state.userInfo.id;
            const data = {
                id: userId,
                age: values.age,
                englishLevel: values.englishLevel,
                firstName: values.firstName,
                language: values.languages,
                lastName: values.lastName,
                middleName: values.middleName,
                phone: values.phone
            }
            try {
                const newEmployee = await API.graphql(graphqlOperation(mutations.updateEmployee, {input: data}));
                message.success("Success Modifying Basic Info!");
            } catch(err) {
                console.log("error in updating employee's info", err);
                message.error("Error in Modifying Basic Info");
            }
            form.resetFields();
            this.setState({ visible: false });
        });
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    }

    render() {
        return (
            <div>
                <Button className='modify-info-button' ghost onClick={this.showModal}>
                <Icon type="file-text" theme="twoTone" twoToneColor="#52c41a"/>{I18n.get("Modify Basic Info")}</Button>
                <CollectionCreateForm
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    add={this.add}
                    remove={this.remove}
                    userInfo={this.state.userInfo}
                />
            </div>
        );
    }
}

export default BasicInfoForm;