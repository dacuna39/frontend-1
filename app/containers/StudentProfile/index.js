/*
 * StudentProfile
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from "react-router-dom";
import styled from 'styled-components';
import { connect } from 'react-redux';

import CenteredSection from './CenteredSection';
import ProfileForm from './ProfileForm';

import HeaderProfile from 'components/HeaderProfile';
import Button from 'components/Button';
import H1 from 'components/H1';
import Cap from 'components/Images/graduation-cap.png';

//import Img from './Img';

const BodyWrapper = styled.div`
  max-width: calc(1000px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

class StudentProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function

  validateForm = () => {

		if(this.props.legalFirstName == '' || this.props.legalLastName == '' ||
			(this.props.major == "" && this.props.userType == "student") ||
			(this.props.degrees == "" && this.props.userType == "tutor") ||
			this.props.subjects.length == 0) {
				alert('Please save your information before continuing');
				return false;
		}
		return true;
	}

  render() {

    return (
      <article>
        <Helmet>
          <title>Student Profile</title>
          <meta name="Tutorfind" content="A web app to connect students and teachers for improved learning" />
        </Helmet>
        
        <HeaderProfile />

        <BodyWrapper>
          <CenteredSection> 
            <br />
            <H1>Student Profile</H1>
            <img src={Cap} width="50px" height="50px" alt="Graduation Cap" />
            <h3> Edit your profile here to make yourself stand out and get more tutoring! </h3>
            
            <ProfileForm /> 

            <Button onClick={() => { // link to student's posts
							  //if (this.validateForm()){
									this.props.history.push("/studentFeed");
								//}
						}}> Go To Feed </Button>
          </CenteredSection>
        </BodyWrapper>
      </article>
    );
  }
}

function mapStateToProps(state) {
	return{
		userId: state.userId,
		userName: state.userName,
		email: state.email,
		password: state.password,
		salt: state.salt,
		userType: state.userType,

		legalFirstName: state.legalFirstName,
		legalLastName: state.legalLastName,
		bio: state.bio,
		img: state.img,
    active: state.active,
    subjects: state.subjects,

		major: state.major, //student props
		minor: state.minor,
		creationDate: state.creationDate,

		degrees: state.degrees, //tutor props
		links: state.links,
		timestamp: state.timestamp,
		ratings: state.ratings,
	}
}

export default withRouter( connect(mapStateToProps)(StudentProfile) );