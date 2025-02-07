import React, { useEffect, useState } from "react";
import db from "./configuration"; // Assuming the correct path to your configuration file
import {collection, serverTimestamp, addDoc} from "firebase/firestore";


function test() {

  async function hash(string: string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  async function createDoc(email: string, password: string) {
    await addDoc(collection(db, "users"), {
      email: email,
      password: await hash(password),
      createdAt: serverTimestamp(),
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => {
          createDoc("test", "test");
        }}> </button>
      </header>
    </div>
  );
}

export default test;
