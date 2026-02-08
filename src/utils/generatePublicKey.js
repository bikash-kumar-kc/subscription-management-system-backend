const generatePublicKey = (url) => {
  const publicKey = url.split("/").at(-1).split(".").at(-2);
  console.log("publicKey",publicKey)
  return publicKey;
};
export default generatePublicKey;
