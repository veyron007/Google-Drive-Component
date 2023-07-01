"use client";
import dynamic from "next/dynamic";

// const gapi = dynamic(import('@gapi-script'), { ssr: false })
import React, { useState, useEffect } from "react";
// import { Row, Col, Spin } from 'antd';
// import styled from 'styled-components';
import { gapi } from "gapi-script";
// import Image from 'next/image';
// import GoogleDriveImage from './google-drive.png';
// import ListDocuments from '../ListDocuments';
// import { style } from './styles';

// const NewDocumentWrapper = styled.div`
//   ${style}
// // `;
// import {
//   Box,
//   Typography,
//   Button,
//   table,
//   tbody,
//   td,
//   thead,
//   tr,
// } from "@mui/material";

// Client ID and API key from the Developer Console
const CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;

// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";

const SelectSource = () => {
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);

  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const handleChange = (file: any) => {
    console.log(file);
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

  const [folderId, setFolderId] = useState<string | number | undefined>("root");
  const documentClickHandler = (document: documentType) => {
    setFolderId(document.id);
  };
useEffect(() => {
    listFolder()
}, [folderId])


  const listFolder = () => {
    // setIsFetchingGoogleDriveFiles(true);
    if (gapi.client == undefined)
    return;
    gapi.client.drive.files
      .list({
        pageSize: 100,
        fields: "files(id, name, mimeType, modifiedTime, parents)",
        // q: `"${folder?folder:'root'}" in parents and mimeType = "application/vnd.google-apps.folder"`,
        // q: `"${'root'}" in parents`,
        q: `"${folderId}" in parents`,
      })
      .then(function (response: any) {
        console.log(response);
        if (response.status == 200) {
          setDocuments(response.result.files);
        }
      })
      .catch((err: any) => {
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
      console.log(a);
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
  }

  return (
    <div>
      <div onClick={() => handleClientLoad()} className="source-container">
        <div className="icon-container">
          <div className="icon icon-success">
            <img height="80" width="80" src="/google-drive.png" />
          </div>
        </div>
        <div className="content-container">
          <p className="title">Google Drive</p>
          <span className="content">
            Import documents straight from your google drive
          </span>
        </div>
      </div>

      {/* <Button onClick={documents} variant="contained" color="primary"> */}
      {/* List Files */}
      {/* </Button> */}

      {documents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>MimeType</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document: documentType) => (
              <tr key={document.id}>
                <td onClick={() => documentClickHandler(document)}>
                  {document.name}
                </td>
                <td>{document.mimeType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No files found.</div>
      )}
    </div>
  );
};

export default SelectSource;
