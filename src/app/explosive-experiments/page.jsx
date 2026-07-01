import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

const ExplosiveExperimentsPage = async () => {
  const user = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(user);

  let data = { result: [] };
  try {
    const API_URL =
      process.env.NODE_ENV === "production"
        ? process.env.REMOTE_SERVER_URL
        : process.env.SERVER_URL;
    const server = process.env.REMOTE_SERVER_URL;
    console.log("API URL in action.js:", server);
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_REMOTE_SERVER_URL}/doctors`,
    );
    data = await result.json();

    console.log("Fetched doctors data:", data.result);
  } catch (error) {
    console.error("Failed to fetch doctors:", error.message);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-r from-card to-accent">
      <h2 className="text-5xl text-chart-5 dark:text-chart-1 font-bold text-center mt-10">
        Explosive Experiments in running
      </h2>
      <p className="text-center mt-4 text-lg">Check the console</p>
      <div className="grid grid-cols-3 gap-5 m-2.5 ">
        {data.result.map((doctor) => (
          <Card
            key={doctor._id}
            className="w-full bg-card border border-border shadow-lg"
          >
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <CardDescription>Running experiments in the lab</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Experiment details will be displayed here.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExplosiveExperimentsPage;
