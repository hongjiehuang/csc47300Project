import React from "react";
import { Form, Icon, Input, Button, Tooltip, DatePicker, Select } from 'antd';
import { Auth, I18n } from 'aws-amplify';
import dict from "../dictionary/dictionary";
import * as mutations from "../../graphql/mutations";
import * as queries from "../../graphql/queries";
import { API, graphqlOperation } from 'aws-amplify';
import "../../style/postJob.css"

const Option = Select.Option;
const { TextArea } = Input;
let jobType = "";
let CreateAddressInput = {};
let CreatePostedJobInput = {};

class PostJob extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lan: window.localStorage.getItem('lan'),
            type: ""
        };
        this.typeUpdate = this.typeUpdate.bind(this);
        this.addressUpdate = this.addressUpdate.bind(this);
        this.jobUpdate = this.jobUpdate.bind(this);
    } 

    typeUpdate = (value) => {
        CreatePostedJobInput["jobType"] = value;
        // console.log(value);
    }

    addressUpdate = (field) => {
        const postForm = document.forms["jobPost"];
        CreateAddressInput[field] = postForm[field].value;
        // console.log(CreateAddressInput);
    }

    jobUpdate = (field) => {
        const postForm = document.forms["jobPost"];
        CreatePostedJobInput[field] = postForm[field].value;
    }

    async handleSubmit () {
        let user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        const postForm = document.forms["jobPost"];
        // const CreateAddressInput = {
        //     line1: postForm["line1"].value,
        //     line2: postForm["line2"].value,
        //     postalCode: postForm["postalCode"].value,
        //     state: postForm["state"].value
        // }
        API.graphql(graphqlOperation(mutations.createAddress, {input: CreateAddressInput}))
            .then(async (address)=>{
                CreatePostedJobInput['postedJobCompanyId'] = attributes.sub;
                CreatePostedJobInput['postedJobLocationId'] = address.data.createAddress.id;
                CreatePostedJobInput['clickedCounts'] = 0;
                CreatePostedJobInput['searchFieldName'] = postForm["jobTitle"].value.toLowerCase();
                CreatePostedJobInput['searchFieldLocation'] = postForm["line1"].value.toLowerCase();
                // const CreatePostedJobInput = {
                //     jobTitle: postForm["jobTitle"].value,
                //     jobType: jobType,
                //     description: postForm["description"].value,
                //     requirements: [postForm["requirement"].value],
                //     datePosted: postForm["postDate"].value,
                //     deadline: postForm["deadline"].value,
                //     clickedCounts: 0,
                //     postedJobCompanyId: attributes.sub,
                //     postedJobLocationId: address.data.createAddress.id,
                //     searchFieldName: postForm["jobTitle"].value.toLowerCase(),
                //     searchFieldLocation: postForm["line1"].value.toLowerCase() + postForm["line2"].value.toLowerCase(),
                // };
                const newJob = await API.graphql(graphqlOperation(mutations.createPostedJob, {input: CreatePostedJobInput}));
                console.log(newJob);
            });
    }

    render() {
        console.log("language", window.localStorage.getItem('lan'));
        I18n.putVocabularies(dict);
        I18n.setLanguage(this.state.lan);
        return (
            <div align="center">
                <br />
                <h1>{I18n.get('Post a New Job')}</h1>
                <Form onSubmit={this.handleSubmit} className="main-form" style={{ "width": "50%" }} name="jobPost">
                    <Form.Item>
                        <Input  placeholder={I18n.get('Enter the Job Title')} 
                            name="jobTitle"
                            onBlur={value => this.jobUpdate("jobTitle")}
                            suffix={
                                <Tooltip title={I18n.get('Enter the name of the job')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                        <Input placeholder={I18n.get('Address Line 1')} 
                            name="line1"
                            onBlur={value => this.addressUpdate("line1")}
                            suffix={
                                <Tooltip title={I18n.get('Line 1 of job address')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                        <Input placeholder={I18n.get('Address Line 2')} 
                            name="line2"
                            onBlur={value => this.addressUpdate('line2')}
                            suffix={
                                <Tooltip title={I18n.get('Line 2 of job address')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                        <Input placeholder={I18n.get('Postal Code')}
                            name="postalCode"
                            onBlur={value => this.addressUpdate('postalCode')}
                            suffix={
                                <Tooltip title={I18n.get('Enter the postal code of the job location')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                        <Input placeholder={I18n.get('City')}
                            name="city"
                            onBlur={value => this.addressUpdate('city')}
                            suffix={
                                <Tooltip title={I18n.get('Enter the city of the job location')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                        <Input placeholder={I18n.get('State')} 
                            name="state"
                            onBlur={value => this.addressUpdate('state')}
                            suffix={
                                <Tooltip title={I18n.get('Enter the state of the job location')}>
                                    <Icon type="info-circle" />
                                </Tooltip>}
                        />
                    </Form.Item>
                    <Form.Item>
                        <DatePicker 
                            onBlur={value => this.jobUpdate("datePosted")}
                            placeholder={I18n.get('Date Posted On')} 
                            name="datePosted" />
                        <br />
                        <DatePicker 
                            onBlur={value => this.jobUpdate("deadline")}
                            placeholder={I18n.get('Deadline')} 
                            name="deadline" />
                    </Form.Item>
                    <Form.Item>
                        <Select onChange={value => this.typeUpdate(value)} placeholder={I18n.get('Job Type')} name="jobType" >
                            <Option value="Full Time">{I18n.get('Full Time')}</Option>
                            <Option value="Part Time">{I18n.get('Part Time')}</Option>
                            <Option value="Internship">{I18n.get('Internship')}</Option>
                            <Option value="Temporary">{I18n.get('Temporary')}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <TextArea
                            onBlur={value => this.jobUpdate("description")}
                            placeholder={I18n.get('Enter Job Description')} 
                            autosize={{ minRows: 2, maxRows: 6 }}
                            name="description"
                        />
                        <TextArea
                            onBlur={value => this.jobUpdate("requirements")}
                            placeholder={I18n.get('Enter Job Requirements')} 
                            autosize={{ minRows: 2, maxRows: 6 }}
                            name="requirements"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" >{I18n.get('Submit Job')}</Button>
                    </Form.Item>
                    <br />
                </Form>
            </div>
        )
    }
}


export default PostJob;