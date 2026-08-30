import { preserveErrorIdentity } from "./preservedError";

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
    // Thrown from tools; must stay identifiable across the AI SDK boundary
    // or the intended message degrades to the generic failure text.
    preserveErrorIdentity(this);
  }
}
