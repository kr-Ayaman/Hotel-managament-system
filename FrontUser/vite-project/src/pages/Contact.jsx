import React from 'react'
import { useState } from 'react'
import { VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE } from '../util/validators'
import "./Contact.css"
import { useForm } from '../hooks/form-hook'
import Input from '../components/FormElements/Input'
import ErrorModal from '../components/UIElements/ErrorModal'
import { useHttpClient  } from '../hooks/http-hook'
import LoadingSpinner from '../components/UIElements/LoadingSpinner'
const Contact = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [isSubmitted, setIsSubmitted] = useState(false);
    const [formState, inputHandler, setFormData] = useForm(
        {
          firstName: {
            value: '',
            isValid: false
          },
          lastName: {
            value: '',
            isValid: false
          },
          email: {
            value: '',
            isValid: false
          },
          message: {
            value: '',
            isValid: false
          }
        },
        false
      );
      const msgSubmit = async event => {
        event.preventDefault();
          try {
            const responseData = await sendRequest(
              'http://localhost:5000/guestportal/send-msg',
              'POST',
              JSON.stringify({
                firstName: formState.inputs.firstName.value,
                lastName: formState.inputs.lastName.value,
                email: formState.inputs.email.value,
                message: formState.inputs.message.value
              }),
              {
                'Content-Type': 'application/json'
              }
            );
            setIsSubmitted(true);
          } catch (err) {
            setIsSubmitted(false);
          }
        }
    return (
      <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {isLoading && <LoadingSpinner asOverlay />}
        <div className='Contact'>
            <div className='get-in'>
                <h1>GET IN TOUCH</h1>
                <div className="get-in-touch">
                    <div className="address text-in-bw">
                        <img src=".\src\assets\address.png" alt="" />
                        <h2>ADDRESS</h2>
                        <p>497 Mansarovar Rd. <br /> Indore, MP <br />
                        Pin-452020</p>
                    </div>
                    <div className="phone text-in-bw">
                        <img src=".\src\assets\phone.png" alt="" />
                        <h2>PHONE</h2>
                        <p>+91 8302XXXXXX <br />
                        +91 8202XXXXXX</p>
                    </div>
                    <div className="email text-in-bw">
                        <img src=".\src\assets\email.png" alt="" />
                        <h2>EMAIL</h2>
                        <p>xyzaindore@gmail.com</p>
                    </div>
                </div>
            </div>
            <div className="message-us-section">
        <h1>Message Us</h1>
        <p>At X Y Z A Hotels, we take our customers seriously. Do you have any enquiries, complaints or requests? Please forward it to our support desk and we will get back to you as soon as possible.</p>
      </div>
      <div className="form-section">
      {isSubmitted && <p className="success-message">Message submitted successfully!</p>}
        <form onSubmit={msgSubmit}>
          <div className="form-row">
            <Input
              id="firstName"
              element="input"
              type="text"
              label="First Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid first name."
              onInput={inputHandler}
              />
            <Input
              id="lastName"
              element="input"
              type="text"
              label="Last Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid last name."
              onInput={inputHandler}
              />
          </div>
          <Input
            id="email"
            element="input"
            type="email"
            label="Email"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email."
            onInput={inputHandler}
            />
          <Input
            id="message"
            element="textarea"
            label="Message"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a message."
            onInput={inputHandler}
            />
          <button type="submit" className="submit-button" disabled={!formState.isValid}>Submit</button>
        </form>
      </div>
        </div>
            </React.Fragment>
    )
}

export default Contact
