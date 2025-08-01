"use client";

import { UppyContextProvider, UppyContext, UploadButton } from "@uppy/react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

import "@uppy/core/dist/style.min.css";

import { useState } from "react";

function createUppy(endpoint: string) {
  return new Uppy().use(Tus, { endpoint });
}

export function Uploader({ endpoint }: { endpoint: string }) {
  const [uppy] = useState(createUppy(endpoint));
  return (
    <UppyContextProvider uppy={uppy}>
      <UploadButton />
    </UppyContextProvider>
  );
}
