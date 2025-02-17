import { useState } from "react";
import AWS from "aws-sdk";
import { FaSpinner } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
});

export default function MemeMinter() {
  const [txHash, setTxHash] = useState("");
  const [memeUrl, setMemeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [safeAddress, setSafeAddress] = useState(""); // New state for Safe address

  const mintNFT = async () => {
    setLoading(true);
    setError("");
    setMemeUrl("");
    setTxHash("");

    try {
      const lambda = new AWS.Lambda({ region: "us-east-1" });
      const params = {
        FunctionName: "memeGenerator",
        Payload: JSON.stringify({ prompt, safeAddress }), // Pass Safe address to Lambda
      };

      const data = await lambda.invoke(params).promise();
      const response = JSON.parse(data.Payload);

      if (response.statusCode === 200) {
        const responseBody = JSON.parse(response.body);
        setMemeUrl(responseBody.ipfsHash);
        setTxHash(responseBody.transactionHash);
      } else {
        setError(response.body.error || "Minting failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-primary">Meme Guardian</h1>

      <div className="card p-4 shadow-lg rounded-lg">
        <div className="text-center mb-4">
          {memeUrl ? (
            <img
              src={`${process.env.REACT_APP_PINATA_URL}/${memeUrl}`}
              alt="Generated Meme"
              className="img-fluid rounded mb-3"
              style={{ width: "400px", height: "400px", objectFit: "cover" }}
            />
          ) : (
            <div className="bg-light py-5 rounded mb-3">
              <p className="text-muted">No meme generated yet</p>
            </div>
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="prompt" className="form-label">
            Enter a Prompt for the Meme
          </label>
          <input
            type="text"
            id="prompt"
            className="form-control"
            placeholder="e.g., Funny dog in a spaceship"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* New Safe Address Input Field */}
        <div className="form-group mb-3">
          <label htmlFor="safeAddress" className="form-label">
            Enter Safe Wallet Address
          </label>
          <input
            type="text"
            id="safeAddress"
            className="form-control"
            placeholder="e.g., 0x1234..."
            value={safeAddress}
            onChange={(e) => setSafeAddress(e.target.value)}
          />
        </div>

        <button
          onClick={mintNFT}
          disabled={loading || !prompt || !safeAddress} // Disable if Safe address is empty
          className={`btn btn-primary w-100 ${loading ? "disabled" : ""}`}
        >
          {loading ? (
            <FaSpinner className="spinner-border spinner-border-sm" />
          ) : (
            "Mint NFT"
          )}
        </button>

        {txHash && (
          <div className="mt-3">
            <p>
              <strong>Transaction Hash: {txHash}</strong>
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-info"
            >
              Check on Sepolia Etherscan
            </a>
          </div>
        )}

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
}
