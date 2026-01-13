import { fetchJourney, fetchLatestEntry } from "../journey-api";

global.fetch = jest.fn();

describe("journey-api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_URL = "http://api.local";
  });

  afterEach(() => {
    delete process.env.API_URL;
  });

  it("returns journey data on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        journey: {
          id: "journey-id",
          name: "Journey",
          start_date: "2024-01-01",
          timezone: "UTC",
          description: null,
        },
      }),
    });

    const result = await fetchJourney("journey-id");

    expect(result.data?.id).toBe("journey-id");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://api.local/journeys/journey-id",
      undefined,
    );
  });

  it("returns error when request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await fetchJourney("journey-id");

    expect(result.data).toBeNull();
    expect(result.error).toBe("HTTP 500");
  });

  it("uses no-store for latest entry", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: {
          id: "entry-id",
          travel_date: "2024-01-01",
          image_url_full: "full",
          image_url_web: "web",
          image_url_thumb: "thumb",
          text_body: "Story",
          location: null,
        },
      }),
    });

    await fetchLatestEntry("journey-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api.local/journeys/journey-id/entries/latest",
      { cache: "no-store" },
    );
  });
});
