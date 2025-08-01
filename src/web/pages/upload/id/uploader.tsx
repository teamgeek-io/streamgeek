"use client";

import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/react/lib/Dashboard";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import { useState } from "react";

function createUppy(endpoint: string) {
  return new Uppy().use(Tus, { endpoint });
}

export function Uploader({ endpoint }: { endpoint: string }) {
  const [uppy] = useState(createUppy(endpoint));
  return <Dashboard theme="auto" uppy={uppy} />;
}
