import React, { useState } from "react";
import "../drop.css";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Table from 'react-bootstrap/Table';
import axios from "axios";

function DragandDrop() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);
  const [PredictionResult, SetPredictionResult] = useState("");
  const [AreaPercent, setAreaPercent] = useState(0);
  const [LocalisationImages, setLocalisationImages] = useState([]);
  const values = [true];
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);

  const handleShow = (breakpoint) => {
    setFullscreen(breakpoint);
    setShow(true);
  };
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      SetPredictionResult("");
    }
  };

  const handleDrop = (event) => {
    if (event.target.files && event.target.files[0]) {
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
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios
      .post("http://127.0.0.1:4000/upload_file/", formdata, config)
      .then((res) => {
        SetPredictionResult(res.data.prediction);
        setLocalisationImages(res.data.localisationimage);
        setAreaPercent(res.data.areapercent);
        setIsProcessing(false);
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
            {selectedFile ? "Image Uploaded" : "Click Here to Upload Image"}
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
          <>
            <p
              className="fs-3"
              style={{
                color: PredictionResult.includes("No Surface Crack")
                  ? "green"
                  : "red",
              }}
            >
              {PredictionResult}
            </p>
            {values.map((v, idx) => (
              <Button
                key={idx}
                className="me-2 mb-2"
                onClick={() => handleShow(v)}
              >
                View Localisation
                {typeof v === "string" && `below ${v.split("-")[0]}`}
              </Button>
            ))}
            <Modal
              show={show}
              fullscreen={fullscreen}
              onHide={() => setShow(false)}
            >
              <Modal.Header closeButton>
                <Modal.Title>Localisation Images and Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Row>
                    <Col>
                      <img
                        src={`data:image/jpeg;base64,${LocalisationImages[0]}`}
                        alt="Selected File"
                      />
                    </Col>
                    <Col>
                      <img
                        src={`data:image/jpeg;base64,${LocalisationImages[1]}`}
                        alt="Selected File"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <h3>Gray-Scale Image</h3>
                    </Col>
                    <Col>
                      <h3>Result Image</h3>
                    </Col>
                  </Row>
                  <br></br>
                  <Row>
                    <Table striped bordered hover variant="dark">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Type of Metric</th>
                          <th>Value of the Metric</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Percentage Area of the Crack</td>
                          <td>{AreaPercent*100}</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Length of the Crack</td>
                          <td>N/A</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Width of the Crack</td>
                          <td>N/A</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Row>
                </Container>
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}

export default DragandDrop;
