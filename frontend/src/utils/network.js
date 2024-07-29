const httpRequest = async ({ url, method, payload }) => {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });
    if (res.status !== 200) throw new Error("Internal server error");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw new err();
  }
};

export default httpRequest;
