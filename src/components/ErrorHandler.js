import React from "react";

const ErrorHandler = (props) => {
  return (
    <>
      <p className="error">{props.error}</p>
    </>
  );
};
export default ErrorHandler;
