import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let appServiceMock: { getHello: jest.Mock };

  beforeEach(async () => {
    appServiceMock = { getHello: jest.fn().mockReturnValue("Hello World!") };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe("getHello", () => {
    it("should return 'Hello World!' from AppService", () => {
      const result = controller.getHello();
      expect(result).toBe("Hello World!");
      expect(appServiceMock.getHello).toHaveBeenCalled();
    });
  });
});
