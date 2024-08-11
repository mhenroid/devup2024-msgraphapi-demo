export const mockMethods = {
  getJson: jest.fn(),
};
export const MockMicrosoftGraphApi = jest.fn().mockImplementation(() => {
  return {
    getJson: mockMethods.getJson,
    get: null,
    post: null,
    delete: null,
    patch: null,
    getPagedData: null,
  };
});
