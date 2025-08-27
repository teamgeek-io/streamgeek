import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";

import createAgentClient from "../../../../agent/client";
import { UploadEditor } from "./editor";
import { getAgent } from "../../../lib/agent";
import { ErrorCard } from "../../../components/error-card";
import { env } from "cloudflare:workers";

export async function UploadEditorPage({
  params,
}: Pick<RequestInfo, "params">) {
  const { id } = params;
  const video = await db.video.findUnique({
    where: {
      id,
    },
  });

  if (!video) {
    return (
      <ErrorCard
        title="Video Not Found"
        message="The requested video could not be found."
      />
    );
  }

  let job = await db.job.findFirst({
    where: {
      videoId: id,
      status: {
        in: ["queued", "encoding"],
      },
    },
    include: {
      agent: true,
    },
  });

  if (job) {
    const agentClient = createAgentClient(job.agent.url, env.AGENTS_API_KEY);
    try {
      await agentClient.ping.$get();
    } catch (error) {
      console.error("Agent not responding", error);
      await db.job.update({
        where: { id: job.id },
        data: { status: "failed" },
      });
      job = null;
    }
  } else {
    const agent = await getAgent();

    if (!agent) {
      return (
        <ErrorCard
          title="No Agent Available"
          message="No agent is currently available. Please make sure at least one agent is running and is pointed to this app."
        />
      );
    }

    // kill any existing jobs for this video
    await db.job.updateMany({
      where: {
        videoId: id,
      },
      data: {
        status: "failed",
      },
    });

    const newJob = await db.job.create({
      data: {
        agentId: agent.id,
        videoId: id,
        status: "queued",
      },
      include: {
        agent: true,
      },
    });

    job = newJob;
  }

  let token: string | undefined;

  if (job?.status === "queued" || job?.status === "encoding") {
    const agentClient = createAgentClient(job.agent.url, env.AGENTS_API_KEY);
    try {
      const tokenResponse = await agentClient["generate-token"][":jobId"].$post(
        {
          param: { jobId: job.id },
        }
      );
      const tokenData = await tokenResponse.json();
      if ("token" in tokenData) {
        token = tokenData.token;
      } else {
        console.error("Token generation failed:", tokenData);
        return (
          <ErrorCard
            title="Token Generation Failed"
            message="Failed to generate upload token. Please try again."
          />
        );
      }
    } catch (error) {
      console.error("Error generating upload token", error);
      return (
        <ErrorCard
          title="Token Generation Error"
          message="An error occurred while generating the upload token. Please try again."
        />
      );
    }
  }

  return (
    <UploadEditor
      videoId={video.id}
      videoTitle={video.title}
      job={job}
      token={token}
    />
  );
}
