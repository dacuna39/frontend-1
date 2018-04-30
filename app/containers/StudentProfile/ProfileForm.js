import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CheckboxOrRadioGroup from 'components/FormComponents/CheckboxOrRadioGroup';
import SingleInput from 'components/FormComponents/SingleInput';
import TextArea from 'components/FormComponents/TextArea';

import CenteredSection from './CenteredSection';
import LeftAlignSection from './LeftAlignSection';
import SubmitInput from './SubmitInput';
import BlueButton from './BlueButton';
import Form from './Form';
import Wrapper from './Wrapper';
import Img from './Img';
import Modal from './Modal'

import Dropzone from 'react-dropzone';
import request from 'superagent';

//actions
import { loadProfile } from './loadProfile';

import jsonSubjects from 'components/subjects.json';

let arraySubjects = eval(jsonSubjects.arraySubjects);

const CLOUDINARY_UPLOAD_PRESET = 'tlkwqrn9';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/tutorfind/image/upload';

class ProfileForm extends Component {

	constructor(props) {
		super(props);
		this.link = 'https://tutor-find.herokuapp.com';

		//console.log("props at profileform: ", this.props);

		this.state = {
			uploadedFileCloudinaryUrl: '',
			userName: this.props.userName,
			email: this.props.email,
			salt: this.props.salt,
			password: this.props.password,
			userType: this.props.userType,

			legalFirstName: this.props.legalFirstName,
            legalLastName: this.props.legalLastName,
            major: this.props.major,
            minor: this.props.minor,
            img: this.props.img,
			bio: this.props.bio,

			subjects: arraySubjects,
			selectedSubjects: this.props.subjects,
			
			active: this.props.active,
			timestamp: this.props.timestamp,

			isChangePassOpen: false, //whether the change password modal is rendered
			isDeactivateOpen: false, //whether the deactivate account modal is rendered

			enterPassword: "",
			newPassword: "",
			reenterPassword: "",
		};

		this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
		this.handleLastNameChange = this.handleLastNameChange.bind(this);
		this.handlePictureChange = this.handlePictureChange.bind(this);
		this.handleMajorChange = this.handleMajorChange.bind(this);
		this.handleMinorChange = this.handleMinorChange.bind(this);
		this.handleBioChange = this.handleBioChange.bind(this);
		this.handleSubjectSelection = this.handleSubjectSelection.bind(this);

		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleNewPassChange = this.handleNewPassChange.bind(this);
		this.handleReenterPassChange = this.handleReenterPassChange.bind(this);

		this.validateForm = this.validateForm.bind(this);
		this.validatePassChange = this.validatePassChange.bind(this);
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
		this.deactivateAccount = this.deactivateAccount.bind(this);
		this.changePassword = this.changePassword.bind(this);
	}

	onImageDrop(files) {
		this.setState({
		  uploadedFile: files[0]
		}, () => { this.handleImageUpload(files[0]) } );
		
	  }

	  handleImageUpload(file) {
		let upload = request.post(CLOUDINARY_UPLOAD_URL)
							.field('upload_preset', CLOUDINARY_UPLOAD_PRESET)
							.field('file', file);
	
		upload.end((err, response) => {
		  if (err) {
			console.error(err);
		  }
	
		  if (response.body.secure_url != '') {
			this.setState({
			  uploadedFileCloudinaryUrl: response.body.secure_url,
			  img: response.body.secure_url,
			});
		  }
		});
	  }


	toggleChangePassModal = () => { //opens and closes the modal
		this.setState({
		  isChangePassOpen: !this.state.isChangePassOpen,
		  isDeactivateOpen: false
		});
	  }

	toggleDeactivateModal = () => { //opens and closes the modal
		this.setState({
			isDeactivateOpen: !this.state.isDeactivateOpen,
			isChangePassOpen: false
		  });
	}

	/* handle variable changes */

	handleFirstNameChange(e) {
		this.setState({ legalFirstName: e.target.value });
	}
	handleLastNameChange(e) {
		this.setState({ legalLastName: e.target.value });
	}
	handlePictureChange(e) {
		this.setState({ img: e.target.value });
	}
	handleMajorChange(e) {
		this.setState({ major: e.target.value });
	}
	handleMinorChange(e) {
		this.setState({ minor: e.target.value });
	}
	handleBioChange(e) {
		this.setState({ bio: e.target.value });
	}

	handleSubjectSelection(e) {
		const newSelection = e.target.value;
		let newSelectionArray;
		if(this.state.selectedSubjects.indexOf(newSelection) > -1) {
			newSelectionArray = this.state.selectedSubjects.filter(s => s !== newSelection);
		} else {
			newSelectionArray = [...this.state.selectedSubjects, newSelection];
		}

		this.setState({ selectedSubjects: newSelectionArray });
	}

	handlePasswordChange(e) {
		this.setState({ enterPassword: e.target.value });
	}
	handleNewPassChange(e) {
		this.setState({ newPassword: e.target.value });
	}
	handleReenterPassChange(e) {
		this.setState({ reenterPassword: e.target.value });
	}
	
	/* validate forms */

	validateForm(){

		var subs = this.state.selectedSubjects;

		for(var i =0; i < subs.length; i++){ // removes bad elements in array
			if(subs[i].includes("\\") || subs[i].includes("\"") || subs[i] == "NULL" || subs[i].length == 0){
				subs.splice(i, 1);
				i = -1;
			}
		}
		this.setState({ selectedSubjects: subs });

		if(this.state.legalFirstName == ''){
			alert('Please enter your first name');
			return false;
		}
		else if(this.state.legalLastName == ''){
			alert('Please enter your last name');
			return false;
		}
		else if(this.state.major == ''){
			alert('Please enter a major');
			return false;
		}
		else if(this.state.selectedSubjects.length == 0){
			alert('Please select at least one subject you need help with');
			return false;
		}
		else {
			return true;
		}
	}

	validatePassChange() {

		if (this.state.newPassword.length < 6){
			alert('Password must be at least 6 characters long');
			return false;
		}
		else if (this.state.newPassword != this.state.reenterPassword){
			alert('New passwords do not match');
			return false;
		}
		else {
			return true;
		}
	}

	/* submit form */

	handleFormSubmit(e) {
		e.preventDefault();

		if(this.validateForm()){

			const formPayload = { //Json to be submitted
				userId: this.props.userId,
				userName: this.state.userName,
				email: this.state.email,
				salt: this.state.salt,
				passhash: this.state.password,
				userType: this.state.userType,
				subjects: this.state.selectedSubjects,

				legalFirstName: this.state.legalFirstName,
				legalLastName: this.state.legalLastName,
				img: this.state.img,
				major: this.state.major,
				minor: this.state.minor,
				bio: this.state.bio,				

				active: this.state.active,
		  		creationDate: this.state.timestamp,
			};

			fetch(this.link + "/students/" + this.props.userId.toString(), { //post profile updates to database :)
				method: 'post',
				headers: {
					'Accept': 'application/json',
				  	'Content-Type': 'application/json',	
				},
				body: JSON.stringify(formPayload)					
			})
			.then(response => { //checks if user was found
				if (response.status == 200){
					//console.log('formPayload: ', JSON.stringify(formPayload));
					this.props.loadProfile(formPayload);
					alert("Saved!");
					//return response.json();
				} else {
					alert("An error occurred, please try again later");
					//console.log('formPayload: ', JSON.stringify(formPayload));
				}
			})
			.catch(error => alert('parsing failed profile form', error));

		}// end if validating form
	}// end handleformsubmit

	deactivateAccount(){
		if(window.confirm("Deleting your account cannot be undone. Are you sure?")){
			
			const payload = { //Json to be submitted
				userId: this.props.userId,
				userName: this.props.userName,
				email: this.props.email,
				salt: this.props.salt,
				passhash: this.props.password,
				userType: this.props.userType,
				subjects: this.props.selectedSubjects,

				legalFirstName: this.props.legalFirstName,
				legalLastName: this.props.legalLastName,
				img: this.props.img,
				major: this.props.major,
				minor: this.props.minor,
				bio: this.props.bio,				

				active: this.props.active,
		  		creationDate: this.props.timestamp,
			};

			fetch(this.link + "/students/delete/" + this.props.userId.toString(), { //sends to deactivate user
				method: 'post',
				headers: {
					'Accept': 'application/json',
				  	'Content-Type': 'application/json',	
				},
				body: JSON.stringify(payload)					
			})
			.then(response => { //checks if user was found
				if (response.status == 200){
					//console.log('formPayload: ', JSON.stringify(formPayload));
					window.location.href = "/"; //goes back to homepage exiting session
				} else {
					alert("An error occurred, please try again later");
					//console.log('formPayload: ', JSON.stringify(formPayload));
				}
			})
			.catch(error => alert('parsing failed profile form', error));

		}//end confirm window
	}

	changePassword(){
 
		if (this.validatePassChange()){ 

			const payload = {
				userId: this.props.userId, 
				passhash: this.state.newPassword, 
			}

			fetch(this.link + "/changepassword/" + this.props.userId.toString() + "/" + this.state.enterPassword, { //post to change password 
				method: 'post', 			
				headers: { 			
					'Accept': 'application/json', 
					'Content-Type': 'application/json',
				}, 
				body: JSON.stringify(payload)
			})
			.then(response => { 
				if (response.status == 200){ 
					//console.log('payload: ', JSON.stringify(payload)); 
					alert("Password Changed!"); 
					//return response.json();
					return true;
				}
				else if (response.status == 404) { 
					//console.log('payload: ', JSON.stringify(payload)); 
					alert("Incorrect password, please try again"); 
					return false;
				}
				else { 
					alert("An error occurred, please try again later"); 
					//console.log('payload: ', JSON.stringify(payload)); 
					return false;
				}
			})
			.then( success => { //clear change pass form 
				if (success == true){
					//this.clearPass();
					this.setstate({
						enterPassword: "", 
						newPassword: "", 
						reenterPassword: "", 	
					});
				}
			}) 					
		    .catch(error => console.log('parsing failed at change password', error));
		}// end validate form 
	}

	render() {
		const { legalFirstName, legalLastName, major, minor, img, bio, password, selectedSubjects } = this.state;

        return(
        <div>
			<br />
        	<Form id="form" onSubmit={this.handleFormSubmit}>
			{/* Profile pic, first/last name, major/minor */}
            <Wrapper>
          	<CenteredSection>
			  <p> Profile Picture </p>
				  
				  <Img src={img} alt="Profile Picture" />
				 
						  <Dropzone
						  multiple={false}
						  accept="image/*"
						  onDrop={this.onImageDrop.bind(this)}
						  style={{"width" : "100%", "height" : "5%", "border" : "0px solid black"}}>
	  
						  <BlueButton form="" onClick={() => {
								   this.setState({ img: this.state.uploadedFileCloudinaryUrl})
							   }}> Change Picture </BlueButton>
						  
						</Dropzone>
						
				</CenteredSection>
          
          	<table>
			<tbody>
			<tr>
				<td>
          		<LeftAlignSection>
            		<p>First Name *</p>
					<SingleInput
						inputType={'text'}
						title={''}
						name={'firstName'}
						controlFunc={this.handleFirstNameChange}
						content={legalFirstName}
						placeholder={"First Name"}/>	
          		</LeftAlignSection>
				</td>
				<td>
				<LeftAlignSection>
            		<p>Last Name *</p>
            		<SingleInput
						inputType={'text'}
						title={''}
						name={'lastName'}
						controlFunc={this.handleLastNameChange}
						content={legalLastName}
						placeholder={'Last Name'} />	
         		</LeftAlignSection>
				</td>
			</tr>
          	<tr>
				<td>
				<LeftAlignSection>
            		<p>Major *</p>
            		<SingleInput
						inputType={'text'}
						title={''}
						name={'major'}
						controlFunc={this.handleMajorChange}
						content={major}
						placeholder={'Major'} />	
          		</LeftAlignSection> 
				</td>
				<td>
            	<LeftAlignSection>
             		<p>Minor</p>
            		<SingleInput
						inputType={'text'}
						title={''}
						name={'minor'}
						controlFunc={this.handleMinorChange}
						content={minor}
						placeholder={'Minor'} />
				</LeftAlignSection>
				</td>
          	</tr>
			</tbody>
			</table>

    	    </Wrapper>

			{/* Subject Options */}
			<Wrapper>
				<CheckboxOrRadioGroup
						title={'Select the subjects you need help with *'}
						setName={'subjects'}
						type={'checkbox'}
						controlFunc={this.handleSubjectSelection}
						options={this.state.subjects}
						selectedOptions={this.state.selectedSubjects} />
			</Wrapper>

        	{/* Bio */}
     		<Wrapper>
          		<CenteredSection>
            	<p> Bio </p>
					<TextArea
						inputType={'text'}
						rows={5}
						cols={60}
						resize={false}
						title={''}
						name={'bio'}
						controlFunc={this.handleBioChange}
						content={this.state.bio}
						placeholder={'Experience, details, and other juicy info goes here!'} />
					<br />

					<SubmitInput 
						type="submit"
						value="Save Changes" />					
				</CenteredSection>
			</Wrapper>
			
			{/* change pass and deactivate buttons */}
			<Wrapper>
				<CenteredSection>
					 <BlueButton form="" onClick={this.toggleChangePassModal}> Change Password </BlueButton>

					 <BlueButton form="" onClick={this.toggleDeactivateModal}> Deactivate Account </BlueButton>
		        </CenteredSection>
      		</Wrapper>
	  	</Form>


		{/* Change Password Modal */}
		<Modal show={this.state.isChangePassOpen}
					onClose={this.toggleChangePassModal}>

				<h4> Change password </h4>
				<label> Enter current password </label> 
				<SingleInput
					inputType={'password'}
					title={''}
					name={'password'}
					controlFunc={this.handlePasswordChange}
					content={this.state.enterPassword}
					placeholder={'Password'} />	

				<label> Enter new password </label> 
				<SingleInput
					inputType={'password'}
					title={''}
					name={'newPassword'}
					controlFunc={this.handleNewPassChange}
					content={this.state.newPassword}
					placeholder={'Password'} />

				<label> Re-enter password </label> 
				<SingleInput
					inputType={'password'}
					title={''}
					name={'reenterPassword'}
					controlFunc={this.handleReenterPassChange}
					content={this.state.reenterPassword}
					placeholder={'Password'} />	

				<BlueButton form="" onClick={this.changePassword}> Change </BlueButton>
		</Modal>

		{/* Deactivate Account Modal */}
		<Modal show={this.state.isDeactivateOpen}
					onClose={this.toggleDeactivateModal}>

				<p> Click here to delete your account </p>
				<BlueButton form="" onClick={this.deactivateAccount}> Deactivate Account </BlueButton>
		</Modal>		
	
    </div>
	) //end return		
	} // end render
}

function mapStateToProps(state) {
	return{
		userId: state.userId,
		userName: state.userName,
		email: state.email,
		password: state.password,
		salt: state.salt,
		userType: state.userType,
		subjects: state.subjects,

		legalFirstName: state.legalFirstName,
		legalLastName: state.legalLastName,
		bio: state.bio,
		img: state.img,
		active: state.active,

		major: state.major, //student props
		minor: state.minor,
		creationDate: state.creationDate,

		degrees: state.degrees, //tutor props
		links: state.links,
		timestamp: state.timestamp,
		ratings: state.ratings,
	}
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({loadProfile: loadProfile}, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(ProfileForm);
