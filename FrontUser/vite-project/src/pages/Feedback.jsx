import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import Input from '../components/FormElements/Input';
import { AuthContext } from '../context/auth-context';
import { useForm } from '../hooks/form-hook';
import { useHttpClient } from '../hooks/http-hook';
import ErrorModal from '../components/UIElements/ErrorModal';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { VALIDATOR_REQUIRE } from '../util/validators';
import './Feedback.css';

const Feedback = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const { bookingType, bookingId } = useParams();
    const { guestId, token } = useContext(AuthContext);
    const [submitted, setsubmitted] = useState(false)
    const [formState, inputHandler] = useForm(
        {
            comments: { value: '', isValid: false },
            rating: { value: 1, isValid: false }
        },
        false
    );


    const submitFeedbackHandler = async (event) => {
        event.preventDefault();

        try {
            const responseData = await sendRequest(
                `http://localhost:5000/guestportal/${bookingType}-booking/${bookingId}/feedback`,
                'POST',
                JSON.stringify({
                    comments: formState.inputs.comments.value,
                    rating: formState.inputs.rating.value,
                }),
                { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            );
            setsubmitted(true)
        } catch (err) {
            setsubmitted(false)
        }
    };
    
    return (
        <div className="feedback-page">
            <ErrorModal error={error} onClear={clearError} />
            <div className="form-container">
                <h1 className="form-title">We Value Your Feedback</h1>
                {submitted && <p>Feedback Submitted</p>}
                <form onSubmit={submitFeedbackHandler}>
                    <Input
                        id="comments"
                        element="textarea"
                        rows="5"
                        label="Your Feedback"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid feedback."
                        onInput={inputHandler}
                    />
                    <div className="rating-container">
                        Rating:
                        {[1, 2, 3, 4, 5].map((num) => {
                            return (
                                <label key={num}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={`${num}`}
                                        onChange={(e) =>
                                            inputHandler("rating", e.target.value, true)
                                        }
                                    />
                                    {num}
                                </label>
                            );
                        })}
                    </div>
                    <button
                        className="submit-button"
                        onClick={submitFeedbackHandler}
                        disabled={!formState.isValid || isLoading}
                    >
                        {isLoading ? <LoadingSpinner /> : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Feedback;
