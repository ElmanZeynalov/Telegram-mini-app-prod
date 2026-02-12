import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import FlowBuilder from "./flow-builder"

export default async function Page() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <FlowBuilder user={session.user} />
}
