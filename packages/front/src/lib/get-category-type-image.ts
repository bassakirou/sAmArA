import { Attachment, Category } from "@type/index";

export const getCategoryTypeImage = (category: Category, variant = "image") => {
  const { image } = category;

  const normalizedImages: Attachment[] = Array.isArray(image)
    ? image
    : image
      ? [image as Attachment]
      : [];

  if (!normalizedImages.length) return null;

  if (variant === "vector" && normalizedImages.length > 1) {
    return normalizedImages[1];
  }

  return normalizedImages[0];
};
