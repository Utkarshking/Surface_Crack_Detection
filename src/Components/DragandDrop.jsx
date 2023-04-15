import React, { useState, useEffect } from "react";
import "../drop.css";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

function DragandDrop() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [PredictionResult, SetPredictionResult] = useState("");
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:4000/api/csrf_token/"
        );
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error(error);
      }
    };

    getCsrfToken();
  }, []);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      // console.log(event.target.files[0]);
      setSelectedFile(event.target.files[0]);
      SetPredictionResult("");
    }
  };

  const handleDrop = (event) => {
    if (event.target.files && event.target.files[0]) {
      // console.log(event.target.files[0]);
      setSelectedFile(event.target.files[0]);
      SetPredictionResult("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const ClearPictureHandler = () => {
    setSelectedFile(null);
    SetPredictionResult("");
    setIsProcessing(false);
  };
  const onRemoveClick = () => {
    setSelectedFile(null);
    SetPredictionResult("");
    setIsProcessing(false);
  };
  const SubmitPictureHandler = () => {
    setIsProcessing(true);
    const formdata = new FormData();
    formdata.append("file", selectedFile);
    console.log(selectedFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        "X-CSRFToken": csrfToken,
      },
    };
    axios
      .post("http://127.0.0.1:4000/upload_file/", formdata, config)
      .then((res) => {
        SetPredictionResult(res.data.message);
        setIsProcessing(false);
        console.log(PredictionResult);
      })
      .catch((err) => {
        console.log(err.message);
        setIsProcessing(null);
        alert("Something went Wrong");
      });
  };

  return (
    <div className="background-border">
      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          id="file-input"
          className="file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="file-input" className="file-label">
          <i className="ri-file-upload-line ri-5x"></i>
          <span>
            {selectedFile
              ? selectedFile.name
              : "Drag and drop files here or click to upload"}
          </span>
        </label>
        <br />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="danger"
            style={{ marginRight: "10px" }}
            onClick={ClearPictureHandler}
          >
            Clear Picture
          </Button>
          <Button variant="success" onClick={SubmitPictureHandler}>
            Submit Picture
          </Button>
        </div>
        <br></br>
        <div className="image-box">
          {selectedFile && (
            <div style={{ position: "relative" }}>
              <button
                type="submit"
                className="close cross"
                onClick={onRemoveClick}
              >
                <span>&times;</span>
              </button>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected File"
                style={{ width: "100px" }}
              />
            </div>
          )}
        </div>
        {isProcessing && (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <p className="fs-3">Loading...</p>
          </>
        )}
        {PredictionResult && (
          <p
            className="fs-3"
            style={{
              color: PredictionResult.includes("No Surface Crack") ? "green" : "red",
            }}
          >
            {PredictionResult}
          </p>
        )}
      </div>
    </div>
  );
}

export default DragandDrop;
