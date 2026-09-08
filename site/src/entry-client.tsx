// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

export default function client() {
  return mount(() => <StartClient />, document.getElementById("app")!);
}
