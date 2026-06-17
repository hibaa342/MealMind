export const detectIngredients = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/fridge/detect", {
    method : "POST",
    body   : formData,
  });

  if (!response.ok) {
    throw new Error("Detection failed");
  }

  return response.json();
};