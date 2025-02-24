"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data from your Hono server
    fetch("/api") // Use /api if you set up the proxy
      .then((response) => response.json())
      .then((data) => console.log("data", data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Data from Hono Server</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
