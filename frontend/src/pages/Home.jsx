import { useState } from "react";
import Layout from "../components/Layout";
import InputForm from "../components/InputForm";
import ResultCard from "../components/ResultCard";

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <Layout>
      <InputForm onResult={setResult} />
      <ResultCard result={result} />
    </Layout>
  );
}
