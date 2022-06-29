import db from "../config/firebase";

interface UpdateIssueProps {
  id: string;
  stack: any;
}

export const updateIssue = async ({ id, stack }: UpdateIssueProps) => {
  const issueSnapshot = await db.collection("issues").doc(id).get();
  if (!issueSnapshot.exists) throw new Error("Issue not found");
  const issue = issueSnapshot.data() as any;
  const prevStacks: any[] = issue?.stacks;

  await db
    .collection("issues")
    .doc(id)
    .update({ stacks: [stack, ...prevStacks] });
};
