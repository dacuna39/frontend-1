/**
 *
 * TutorFeed
 *
 * HOW PRINTING POSTS WORKS:
 * On componentdidmount (once page loads), it retrieves all student posts and sets it to this.state.posts
 * When that is done, it calls createpostsTable, where it creates the html to display each posts
 * createPostsTable saves the posts html in this.state.printPosts and makes this.state.postsReady to true
 * 
 * in the render method is printPosts, which is a method that waits until postsReady is set to true to render
 * the posts
 * 
 */

import React from 'react';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { withRouter } from "react-router-dom";
import styled from 'styled-components';

import HeaderFeed from 'components/HeaderFeed';
import Button from 'components/Button';
import H1 from 'components/H1';
import CheckboxTableStyle from 'components/TableCheckbox/CheckboxTableStyle';
import GroupDown from 'components/FormComponents/GroupDown';
import SingleInput from 'components/FormComponents/SingleInput';
import PostStudent from 'components/PostStudent';

import CenteredSection from './CenteredSection';
import Modal from 'components/Modal';
import ModalFixed from 'components/ModalFixed';
import NewPostForm from './NewPostForm';
import Img from './Img';
import Wrapper from './Wrapper';

import Cap from 'components/Images/graduation-cap.png';

const BodyWrapper = styled.div`
  max-width: calc(1000px + 16px * 2);
	margin: 0 auto;
	
	font-family: Open Sans;

  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

const FilterContainer = styled.div`
	width: 18%;
`;

const FeedContainer = styled.div`
	width: 82%;
`;

export class TutorFeed extends React.Component { // eslint-disable-line react/prefer-stateless-function

	constructor(props) {
		super(props);
		this.link = 'https://tutor-find.herokuapp.com';

		this.state = {
			posts: [],
			printPosts: [],
			postsReady: false,

			filterOptions: ["All Subjects", "My Subjects"],
			filter: ["All Subjects"],

			isOpen: false, //whether the new post modal is rendered

			expandPostRender: false, //whether the expanded post is rendered
			student: { firstName: '', lastName: '', img: '', major: '' },
			post: { subject: '', availability: '', location: '', rate: '' },

			searchPostInput: '',
		};
	}

	toggleModal = () => { //opens and closes the new post modal
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	handleFilterSelect = (e) => {
		this.setState({ filter: [e.target.value] });
	}

	componentDidMount() {
		this.fetchAllPosts();
	}

	/* 
	 * Fetch & filter methods 
	 */

	filterButtonClick = () => {
		if (this.state.filter == "All Subjects") {
			this.fetchAllPosts();
		}
		else if (this.state.filter == "My Subjects") {
			this.filterPosts();
		}
	}

	filterPosts = () => {
		var allPosts = [];

		fetch(this.link + '/posts/subject/' + this.props.subjects, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
			.then(response => response.json())
			.then(posts => {
				//console.log('posts', posts);
				for (var i = 0; i < posts.length; i++) {
					if (i <= 40 && posts[i].posterType == "student") {// loads the 40 most recent posts
						allPosts.push(posts[i]);
					}
					else if (i > 40) {
						break;
					}
				}
				//console.log('allposts', allPosts)
				this.setState({ posts: allPosts, postsReady: false }, () => this.createPostsTable());
			})
			.catch(error => console.log('parsing failed', error));
	}

	fetchAllPosts = () => {
		var allPosts = [];

		fetch(this.link + '/posts?type=student', {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
			.then(response => response.json())
			.then(posts => {

				for (var i = 0; i < posts.length; i++) {
					if (i <= 40) {// loads the 40 most recent posts
						allPosts.push(posts[i]);
					}
				}

				this.setState({ posts: allPosts, postsReady: false }, () => this.createPostsTable());
			})
			.catch(error => console.log('parsing failed', error));
	}

	handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			if (this.state.searchPostInput.length > 0)
				this.fetchPostsByUser();
		}
	}

	fetchPostsByUser = () => {
		var allPosts = [];

		fetch(this.link + '/posts?name=' + this.state.searchPostInput, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
			.then(response => response.json())
			.then(posts => {

				for (var i = 0; i < posts.length; i++) {
					if (i <= 40 && posts[i].posterType === "student") {// loads the 40 most recent posts
						allPosts.push(posts[i]);
					}
				}
				console.log('all posts', allPosts)

				this.setState({ posts: allPosts, postsReady: false }, () => this.createPostsTable());
			})
			.catch(error => console.log('parsing failed', error));
	}


	/* 
	 * Create and render posts methods 
	 */

	createPostsTable = () => {
		var returnPosts = [];

		if (this.state != null) {

			if (this.state.posts.length >= 0) {
				return this.state.posts.map((post, index) => {	//for each post...

					//ensures that no glitchy posts crash the app :)
					if (post.subject != null && post.location != null && post.availability != null
						&& post.rate != null && post.unit != null) {

						//fetch the post owner's info
						fetch(this.link + '/students/' + post.ownerId, {
							method: 'get',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							}
						})
							.then(response => {
								if (response.status == 200) { //checks if user was found
									return response.json();
								} else {
									return null;
								}
							})
							.then(student => {
								//console.log('student', student);
								//console.log('post', post)

								if (student != null && student != undefined) {

									/* make availability string */
									var avail = "";
									for (var i = 0; i < post.availability.length; i++) {
										if (post.availability.charAt(i).match(/[a-zA-Z]/)) {
											avail += post.availability.charAt(i);
										} else if (post.availability.charAt(i).match(/[,]/)) {
											avail += " | ";
										} else {
											avail += " ";
										}
									}

									/* make hourly rate string */
									var rateString = 'Requesting Free Tutoring';

									if (post.acceptsPaid == true) {
										rateString = post.rate + ' ' + post.unit;
									}

									returnPosts.push(
										<PostStudent
											key={index}
											postId={post.postId}
											firstName={student.legalFirstName}
											lastName={student.legalLastName}
											img={student.img}
											major={student.major}

											subject={post.subject}
											location={post.location}
											availability={avail}
											rate={rateString}
											expandPostFunc={() => {
												this.expandPost(student, {
													subject: post.subject,
													location: post.location,
													availability: avail,
													rate: rateString,
													ownerId: post.ownerId,
												})
											}}
										/>
									)

									this.setState({ printPosts: returnPosts, postsReady: true });
								}//end if student != null
							})//end then
							.catch(error => console.log('parsing failed', error));
					}//end check bad posts
				});//end map posts
			}//end if posts.length > 0
		}//end check if state is null
	}

	printPosts = () => {
		if (this.state.postsReady == true) {
			//console.log('printposts', this.state.printPosts);

			//var sortedPosts = this.state.printPosts.sort((a,b) => a.key < b.key); //sorts to most recent posts first
			//console.log("Sorted post", sortedPosts);

			return this.state.printPosts.map((post, index) => {
				return (
					<div key={index}> {post} </div>
				);
			});//end map
		} else {
			return (
				<CenteredSection>
					<br /> <h3> Could not find any posts! </h3>
					<h3> Try adding more subjects in your profile or search for all posts on the right sidebar! </h3>
					<br />
				</CenteredSection>
			);
		}
	}

	/* 
	 * expand post and apply methods 
	 */

	expandPost = (student, post) => {
		this.setState({
			expandPostRender: true,
			student: student,
			post: post,
		});
	}

	apply = () => {
		fetch('https://tutor-find.herokuapp.com/students/' + this.state.post.ownerId.toString())
			.then(response => response.json()) //gets post owner from server
			.then(owner => owner.email) //gets owner's email	  
			.then(mail => { //on success
				var email = mail;
				var subject = "A Tutor is interested in your listing!";
				var body = "Hello, I'm interested! Please let me know if you'd like to connect.";
				body += "    Name: " + this.props.legalFirstName + " " + this.props.legalLastName +
					"    Highest degree: " + this.props.degrees;

				var win = window.open("", "emailLink", "width=300,height=100");
				win.document.close();
				win.document.write('<a href="mailto:' + email + '?subject=' + subject + '&body=' + body + '">' + 'Click here to email the student.' + '<' + '/a>');
				win.focus();
			})
			.catch(error => console.log('parsing failed', error));
	}

	render() {

		if (this.state != null) {
			return (
				<div>
					<Helmet>
						<title> TutorFeed </title>
						<meta name="description" content="Description of TutorFeed" />
					</Helmet>

					<HeaderFeed />

					<CheckboxTableStyle>
						<GroupDown
							title={''}
							type={'radio'}
							setName={'filter'}
							controlFunc={this.handleFilterSelect}
							options={this.state.filterOptions}
							selectedOptions={this.state.filter}
						/>
						<Button onClick={this.filterButtonClick} > Filter Subjects </Button>

						<div onKeyPress={this.handleKeyPress}>
							<SingleInput
								inputType={'text'}
								title={"Search by User"}
								name={'searchPost'}
								controlFunc={(e) => this.setState({ searchPostInput: e.target.value })}
								content={this.state.searchPostInput}
								placeholder={''}
							/>
							<Button onClick={this.fetchPostsByUser}> Search </Button>
						</div>

						<Button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }) }}> Back To Top </Button>
					</CheckboxTableStyle>
					{/* end sidebar */}

					<BodyWrapper>
						<CenteredSection>
							<br />
							<H1> Available Students </H1>
							<Img src={Cap} alt="Graduation Cap" />
							<h3> These students are looking for tutors! Find a student that you want to tutor and click apply to email them. </h3>
							<hr />
							{/* make a new post */}
							<Button onClick={this.toggleModal}> New Post </Button>

							<Modal show={this.state.isOpen} onClose={this.toggleModal}>
								<H1> New Post </H1>
								<NewPostForm />
							</Modal>
							{/* end make new post */}

							{/* link to tutorPost */}
							<Button onClick={() => this.props.history.push("/tutorPosts")}> My Posts </Button>

							{/* render expanded post modal */}
							<ModalFixed show={this.state.expandPostRender} onClose={() => this.setState({ expandPostRender: false })}>
								<h3> {this.state.student.legalFirstName} {this.state.student.legalLastName} </h3>
								<img src={this.state.student.img} width="150px" height="150px" alt="Profile Picture" />
								<p> Major: {this.state.student.major} </p>
								<hr />
								<p> Subject: {this.state.post.subject} </p>
								<p style={{margin: '0', marginBottom: '8px'}}> Preferred Meeting Location: {this.state.post.location} </p>
								<p style={{margin: '0'}}> {this.state.post.availability} </p>
								<p> {this.state.post.rate} </p>
								<Button onClick={this.apply}> Apply </Button>
							</ModalFixed>
							{/* end render expanded post modal */}

						</CenteredSection>
					</BodyWrapper>

					<Wrapper>
						<FilterContainer>
							{/* placeholder that reserves space for the fixed filter component*/}
						</FilterContainer>

						<FeedContainer>
							{/* Load student posts */}
							{this.printPosts()}
						</FeedContainer>
					</Wrapper>
				</div>
			);
		}
		else {
			return (
				<div>
					<Helmet>
						<title> TutorFeed </title>
						<meta name="description" content="Description of TutorFeed" />
					</Helmet>

					<HeaderFeed />
					<CenteredSection>
						<br /> <H1> Loading... </H1> <br />
					</CenteredSection>
				</div>
			);
		}
	}
}

function mapStateToProps(state) {

	return {
		legalFirstName: state.legalFirstName,
		legalLastName: state.legalLastName,
		bio: state.bio,
		degrees: state.degrees,
		subjects: state.subjects,
	}
}

export default withRouter(connect(mapStateToProps)(TutorFeed));
