import React, { useState, useContext } from 'react';
import Input from '../components/FormElements/Input';
import ErrorModal from '../components/UIElements/ErrorModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { useHttpClient } from '../hooks/http-hook';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../util/validators';
import { useForm } from '../hooks/form-hook';
import { AuthContext } from '../context/auth-context';
import Button from '../components/FormElements/Button';
import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [email, setEmail] = useState('');
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: { value: '', isValid: false },
      password: { value: '', isValid: false }
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          firstName: undefined,
          lastName: undefined,
          phone: undefined,
          address: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          firstName: { value: '', isValid: false },
          lastName: { value: '', isValid: false },
          phone: { value: '', isValid: false },
          address: { value: '', isValid: false }
        },
        false
      );
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  const authSubmitHandler = async event => {
  event.preventDefault();
  if (isLoginMode) {
    try {
      const responseData = await sendRequest(
        'http://localhost:5000/guestportal/login',
        'POST',
        JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value
        }),
        { 'Content-Type': 'application/json' }
      );
      auth.login(responseData.guestId, responseData.token);
      history.push("/")
    } catch (err) {}
  } else {
    try {
      const responseData = await sendRequest(
        'http://localhost:5000/guestportal/signup',
        'POST',
        JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
          first_name: formState.inputs.firstName.value,
          last_name: formState.inputs.lastName.value,
          phone_number: formState.inputs.phone.value,
          address: formState.inputs.address.value,
        }),
        { 'Content-Type': 'application/json' }
      );
      setEmail(formState.inputs.email.value);
      setIsOtpMode(true);
    } catch (err) {}
  }
};


  const otpSubmitHandler = async event => {
    event.preventDefault();
    try {
      const responseData = await sendRequest(
        'http://localhost:5000/guestportal/verify-otp',
        'POST',
        JSON.stringify({
          email: email,
          otp: formState.inputs.otp.value
        }),
        { 'Content-Type': 'application/json' }
      );
      auth.login(responseData.guestId, responseData.token);
      history.push("/")
    } catch (err) {}
  };

  return (
    <div className="auth-container">
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <div className="auth-card">
        <h2>{isOtpMode ? 'Enter OTP' : 'Login to XYZ Hotel'}</h2>
        <form className="auth-form" onSubmit={isOtpMode ? otpSubmitHandler : authSubmitHandler}>
          {!isOtpMode && !isLoginMode && (
            <React.Fragment>
              <div className="input-container">
                <i className="fas fa-user input-icon"></i>
                <Input
                  element="input"
                  id="firstName"
                  type="text"
                  label="First Name"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Please enter your first name."
                  onInput={inputHandler}
                />
              </div>
              <div className="input-container">
                <i className="fas fa-user input-icon"></i>
                <Input
                  element="input"
                  id="lastName"
                  type="text"
                  label="Last Name"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Please enter your last name."
                  onInput={inputHandler}
                />
              </div>
              <div className="input-container">
                <i className="fas fa-phone input-icon"></i>
                <Input
                  element="input"
                  id="phone"
                  type="text"
                  label="Phone Number"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Please enter a valid phone number."
                  onInput={inputHandler}
                />
              </div>
              <div className="input-container">
                <i className="fas fa-home input-icon"></i>
                <Input
                  element="input"
                  id="address"
                  type="text"
                  label="Address"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Please enter your address."
                  onInput={inputHandler}
                />
              </div>
            </React.Fragment>
          )}
          {!isOtpMode && (
            <React.Fragment>
              <div className="input-container">
                <i className="fas fa-envelope input-icon"></i>
                <Input
                  element="input"
                  id="email"
                  type="email"
                  label="E-Mail"
                  validators={[VALIDATOR_EMAIL()]}
                  errorText="Please enter a valid email address."
                  onInput={inputHandler}
                />
              </div>
              <div className="input-container">
                <i className="fas fa-lock input-icon"></i>
                <Input
                  element="input"
                  id="password"
                  type="password"
                  label="Password"
                  validators={[VALIDATOR_MINLENGTH(6)]}
                  errorText="Please enter a valid password, at least 6 characters."
                  onInput={inputHandler}
                />
              </div>
            </React.Fragment>
          )}
          {isOtpMode && (
            <React.Fragment>
              <div className="input-container">
                <i className="fas fa-key input-icon"></i>
                <Input
                  element="input"
                  id="otp"
                  type="text"
                  label="OTP"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Please enter the OTP sent to your email."
                  onInput={inputHandler}
                />
              </div>
              <p className="otp-info">The OTP is valid for 10 minutes.</p>
            </React.Fragment>
          )}
          <Button type="submit" disabled={!formState.isValid}>
            {isOtpMode ? 'VERIFY OTP' : isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        {!isOtpMode && (
          <div className="auth-footer">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span onClick={switchModeHandler} style={{ cursor: 'pointer', color: '#007bff' }}>
              {isLoginMode ? 'Register here' : 'Login here'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
