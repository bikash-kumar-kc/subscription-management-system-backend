const generatePublicKey = (url) => {
  const publicKey = url.split("/").at(-1).split(".").at(-2);
  return publicKey;
};
export default generatePublicKey;
