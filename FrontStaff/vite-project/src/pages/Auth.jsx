import React, { useState, useContext, useEffect } from 'react';
import Input from '../components/FormElements/Input';
import ErrorModal from '../components/UIElements/ErrorModal';
import { useHistory } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { useHttpClient } from '../hooks/http-hook';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../util/validators';
import { useForm } from '../hooks/form-hook';
import { AuthContext } from '../context/auth-context';
import Button from '../components/FormElements/Button';
import './Auth.css';

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: { value: '', isValid: false },
      password: { value: '', isValid: false },
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
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          'http://localhost:5000/staffportal/signin',
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { 'Content-Type': 'application/json' }
        );
        auth.login(
          responseData.staffId,
          responseData.position,
          responseData.token
        );

        // Conditional routing based on position
        if (responseData.position === 'Receptionist') {
          history.push('/receptionist/');
        } else if (responseData.position === 'Restaurant Staff') {
          history.push('/restaurant/orders');
        } else if (responseData.position === 'Manager') {
          history.push('/manager/staff');
        }
      } catch (err) {}
    }
  };

  return (
    <div className="auth-container">
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <div className="auth-card">
        <form className="auth-form" onSubmit={authSubmitHandler}>
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
          <Button type="submit" disabled={!formState.isValid}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
