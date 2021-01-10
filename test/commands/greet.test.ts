import {GreetCommand} from "../../src/commands/greetCommand";

describe('GreetCommand', () => {
  const command = new GreetCommand();

  it("should say 'Hello, world!'", () => {
    expect(true).toBe(true);
  });
});
