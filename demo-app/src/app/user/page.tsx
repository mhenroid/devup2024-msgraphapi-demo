import GraphServerExample from "@/components/GraphServerExample";
import WelcomeMessage from "@/components/WelcomeMessage";
import Link from "next/link";

export default function UserPage() {
  return (
    <>
      <h1>Demo Home</h1>

      <WelcomeMessage />
      <ul>
        <li>
          <Link href="/user/accessToken">View current access token</Link>
        </li>
      </ul>

      <GraphServerExample />
    </>
  );
}
