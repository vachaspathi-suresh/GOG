import React from "react";

const Loader = () => {
  return (
    <div
      style={{
        height: "80vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img alt="LOADING..." src="/pacmanLoader.gif" style={{ width: "40%" }} />
    </div>
  );
};

export default Loader;
