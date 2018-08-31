import { expect } from "chai";
import { createStores } from "./stores";
import { ProblemModel } from "./problem";
import { UserModel } from "./user";

describe("stores object", () => {

  it("supports creating dummy stores for testing", () => {
    const stores = createStores();
    expect(stores).to.exist;
    expect(stores.user).to.exist;
    expect(stores.problem).to.exist;
    expect(stores.ui).to.exist;
  });

  it("supports passing in stores for testing", () => {
    const devMode = true;
    const name = "Colonel Mustard";
    const user = UserModel.create({ name });
    const title = "Test Problem";
    const problem = ProblemModel.create({ ordinal: 1, title });
    const stores = createStores({ devMode, user, problem });
    expect(stores.devMode).to.equal(true);
    expect(stores.user.name).to.equal(name);
    expect(stores.problem.title).to.equal(title);
  });

});
