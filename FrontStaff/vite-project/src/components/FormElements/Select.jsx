import React, { useReducer, useEffect } from "react";
import { validate } from "../../util/validators"; // Adjust path as necessary
import "./Select.css";

const selectReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Select = (props) => {
  const [selectState, dispatch] = useReducer(selectReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = selectState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  return (
    <div
      className={`form-control ${
        !selectState.isValid && selectState.isTouched && "form-control--invalid"
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        value={selectState.value}
        onChange={changeHandler}
        onBlur={touchHandler}
      >
        {props.options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!selectState.isValid && selectState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Select;
