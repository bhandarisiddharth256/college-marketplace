import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createListing,
  updateListing,
  getListingById,
  removeListingImage,
  reorderListingImages,
} from "../api/listings.api";
import { suggestPrice } from "../api/price.api";

function AddListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("used");
  const [images, setImages] = useState([]);

  // Edit mode images
  const [existingImages, setExistingImages] = useState([]);

  // AI price suggestion
  const [ageInMonths, setAgeInMonths] = useState("");
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [lastSuggestInput, setLastSuggestInput] = useState(null);
  const [confidence, setConfidence] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 FETCH LISTING (EDIT MODE)
  useEffect(() => {
    if (!isEditMode) return;

    const fetchListing = async () => {
      try {
        const res = await getListingById(id);
        const data = res.data;

        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category);
        setCondition(data.condition);
        setExistingImages(data.images || []);

        // 🔥 IMPORTANT FIX: initialize lastSuggestInput
        setLastSuggestInput({
          price: String(data.price),
          category: data.category,
          condition: data.condition,
          ageInMonths: "", // user has not provided age yet
        });
      } catch {
        alert("Failed to load listing for edit");
      }
    };

    fetchListing();
  }, [id, isEditMode]);

  // 🔹 CONFIDENCE CALCULATION
  const calculateConfidence = (suggested, min, max) => {
    const range = max - min;
    if (range === 0) return 100;

    const distanceFromCenter = Math.abs(suggested - (min + max) / 2);

    const confidence = 100 - (distanceFromCenter / (range / 2)) * 100;

    return Math.max(0, Math.min(100, Math.round(confidence)));
  };

  // 🔹 AI PRICE SUGGESTION
  const handleSuggestPrice = async (auto = false) => {
    if (!price || !category || !condition || !ageInMonths) {
      if (!auto) alert("Fill base price, category, condition & age");
      return;
    }

    const currentInput = {
      price,
      category,
      condition,
      ageInMonths,
    };

    if (
      lastSuggestInput &&
      JSON.stringify(lastSuggestInput) === JSON.stringify(currentInput)
    ) {
      return;
    }

    try {
      setSuggestLoading(true);

      const res = await suggestPrice({
        basePrice: Number(price),
        category,
        condition,
        ageInMonths: Number(ageInMonths),
      });

      const data = res.data;

      setPriceSuggestion(data);
      setLastSuggestInput(currentInput);

      const conf = calculateConfidence(
        data.suggestedPrice,
        data.minPrice,
        data.maxPrice,
      );
      setConfidence(conf);
    } catch (err) {
      if (!auto) {
        alert(err.response?.data?.message || "Failed to get price suggestion");
      }
    } finally {
      setSuggestLoading(false);
    }
  };

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !price || !category) {
      setError("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("condition", condition);
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(true);
      isEditMode
        ? await updateListing(id, formData)
        : await createListing(formData);
      navigate("/my-listings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 IMAGE REMOVE
  const handleRemoveImage = async (imageUrl) => {
    if (!window.confirm("Remove this image?")) return;
    await removeListingImage(id, imageUrl);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  // 🔹 IMAGE REORDER
  const moveImageUp = async (index) => {
    if (index === 0) return;
    const newImages = [...existingImages];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    await reorderListingImages(id, newImages);
    setExistingImages(newImages);
  };

  const moveImageDown = async (index) => {
    if (index === existingImages.length - 1) return;
    const newImages = [...existingImages];
    [newImages[index + 1], newImages[index]] = [
      newImages[index],
      newImages[index + 1],
    ];
    await reorderListingImages(id, newImages);
    setExistingImages(newImages);
  };

  const isSuggestionUnchanged =
    lastSuggestInput &&
    lastSuggestInput.price === price &&
    lastSuggestInput.category === category &&
    lastSuggestInput.condition === condition;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {isEditMode ? "Edit Listing" : "Add Listing"}
      </h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="w-full border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="used">Used</option>
        </select>

        <input
          type="file"
          multiple
          onChange={(e) => setImages([...e.target.files])}
        />

        <input
          type="number"
          placeholder="Item age (in months)"
          className="w-full border p-2 rounded"
          value={ageInMonths}
          onChange={(e) => setAgeInMonths(e.target.value)}
          onBlur={() => handleSuggestPrice(true)}
        />

        <button
          type="button"
          onClick={() => handleSuggestPrice(false)}
          disabled={suggestLoading || isSuggestionUnchanged}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {suggestLoading
            ? "Calculating..."
            : isSuggestionUnchanged
              ? "Price Already Suggested"
              : "Suggest Price"}
        </button>

        {priceSuggestion && (
          <div className="border p-3 rounded bg-purple-50">
            <p>
              <b>Suggested Price:</b> ₹{priceSuggestion.suggestedPrice}
            </p>
            <p className="text-sm text-gray-600">
              Range: ₹{priceSuggestion.minPrice} – ₹{priceSuggestion.maxPrice}
            </p>

            <div className="mt-2">
              <p className="text-sm mb-1">Confidence: {confidence}%</p>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="h-2 bg-green-600 rounded"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPrice(priceSuggestion.suggestedPrice)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
            >
              Use Suggested Price
            </button>
          </div>
        )}

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Listing"
              : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

export default AddListing;
