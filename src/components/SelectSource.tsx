"use client";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";

// const gapi = dynamic(import('@gapi-script'), { ssr: false })
import React, { useState, useEffect } from "react";
// import { Row, Col, Spin } from 'antd';
// import styled from 'styled-components';
import { gapi } from "gapi-script";
import { styled } from "@mui/material/styles";
import { Box, Avatar } from "@mui/material";

// import GoogleDriveImage from './google-drive.png';

import Button from "@mui/material/Button";

// Client ID and API key from the Developer Console
const CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;

// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";

const SelectSource = () => {
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);
  let [videoSource, setVideoSource] = useState<string>("");

  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const handleChange = (file: any) => {
    // console.log(file);
  };

  /**
   * Print files.
   */
  //   const listFiles = (searchTerm = null) => {
  //     setIsFetchingGoogleDriveFiles(true);
  //     gapi.client.drive.files
  //       .list({
  //         pageSize: 10,
  //         fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
  //         q: searchTerm,
  //       })
  //       .then(function (response: any) {
  //         setIsFetchingGoogleDriveFiles(false);
  //         setListDocumentsVisibility(true);
  //         const res = JSON.parse(response.body);
  //         console.log(res);

  //         // setDocuments(res.files);
  //       });
  type keyObject = {
    [key: string]: any;
  };
  const [parentMap, setParentMap] = useState<keyObject>({});

  const [folderId, setFolderId] = useState<string | number | undefined>("root");
  const documentClickHandler = (document: documentType) => {
    if (document.mimeType == "application/vnd.google-apps.folder") {
      setFolderId(document.id);
    } else if (document.mimeType.indexOf("video") != -1) {
      setVideoSource(document.webContentLink);
    } else setVideoSource("");
  };
  useEffect(() => {
    listFolder();
  }, [folderId]);

  useEffect(() => {
    // console.log(parentMap);
  }, [parentMap]);

  const listFolder = () => {
    // setIsFetchingGoogleDriveFiles(true);
    if (gapi.client == undefined) return;
    gapi.client.drive.files
      .list({
        // pageSize: 100,
        fields:
          "files(id, name, mimeType, modifiedTime, parents, webContentLink)",
        // q: `"${folder?folder:'root'}" in parents and mimeType = "application/vnd.google-apps.folder"`,
        // q: `"${'root'}" in parents`,
        q: `"${folderId}" in parents`,
      })
      .then(function (response: any) {
        // console.log(response);
        if (response.status == 200) {
          let obj: keyObject = {};
          for (let i of response.result.files) {
            if (i.mimeType == "application/vnd.google-apps.folder") {
              obj[i.id] = folderId;
            }
          }
          // console.log(obj);
          obj = { ...parentMap, ...obj };
          setParentMap(obj);
          setDocuments(response.result.files);
        }
      })
      .catch((err: Error) => {
        console.log(err);
      });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  const updateSigninStatus = (isSignedIn: boolean) => {
    if (isSignedIn) {
      // Set the signed in user
      //   let a = gapi.auth2.getAuthInstance().currentUser.je.Qt;
      let a = gapi.auth2.getAuthInstance().currentUser.le.wt;
      // console.log(a);
      //   return;
      setSignedInUser(a);
      setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      listFolder();
    } else {
      // prompt user to sign in
      handleAuthClick();
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignOutClick = () => {
    setListDocumentsVisibility(false);
    gapi.auth2.getAuthInstance().signOut();
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error: Error) {}
      );
  };

  const handleClientLoad = () => {
    gapi.load("client:auth2", initClient);
  };

  const showDocuments = () => {
    setListDocumentsVisibility(true);
  };

  const onClose = () => {
    setListDocumentsVisibility(false);
  };

  interface documentType {
    name: string;
    id?: string | number;
    mimeType: string;
    webContentLink: string;
  }
  const ContentSpan = styled("span")({
    display: "inline-block",
    backgroundColor: "#f5f5f5",
    padding: "8px 16px",
    borderRadius: "10px",
    margin: "20px",
    cursor: "pointer",
  });

  return (
    <div>
      <div>
        <Box display="flex" justifyContent="center">
          <img style={{ height: 80, width: 80 }} src="/google-drive.png" />
        </Box>
        <div>
          <Typography variant="h6" component="p">
            Google Drive
          </Typography>
          <Typography
            onClick={() => handleClientLoad()}
            variant="body1"
            component={ContentSpan}
          >
            Import documents straight from your Google Drive
          </Typography>
          <br />
          <br />
        </div>
      </div>
      <Button
        onClick={() => {
          let parent = parentMap[folderId as keyof typeof parentMap];
          setFolderId(parent);
          setVideoSource("");
        }}
        disabled={folderId == "root"}
        variant="contained"
        color="primary"
      >
        Back
      </Button>
      
      <Button onClick={() =>handleSignOutClick()} variant = "contained" color="primary">Sign Out</Button>
      {documents.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>File Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document: documentType) => (
              <TableRow
                key={document.id}
                onClick={() => documentClickHandler(document)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{document.name}</TableCell>
                <TableCell>{document.mimeType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body1" align="center">
          No files found.
        </Typography>
      )}
      <video
        className={videoSource == "" ? "d-none" : ""}
        key={videoSource}
        width="1280"
        height="720"
        controls
      >
        <source src={videoSource} type="video/mp4" />
      </video>
    </div>
  );
};

export default SelectSource;
