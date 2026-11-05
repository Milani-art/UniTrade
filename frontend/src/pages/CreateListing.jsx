import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateListing.css";

export default function CreateListing() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
        condition: "",
        location: "",
        image: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [imageFileName, setImageFileName] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.");
            e.target.value = "";
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Please choose an image smaller than 2 MB.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({ ...prev, image: reader.result }));
            setImageFileName(file.name);
            setError("");
        };
        reader.onerror = () => setError("Unable to read that image. Please try another file.");
        reader.readAsDataURL(file);
    };

    const clearUploadedImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImageFileName("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        let user;
        try {
            user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, imageUrl: formData.image, sellerId: user?.id, price: Number(formData.price) }),
            });
            if (!response.ok) throw new Error(await response.text() || 'Unable to publish this listing.');
            navigate('/search');
        } catch (submissionError) {
            setError(submissionError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="listing-page">
            <header className="listing-heading">
                <div>
                    <span className="listing-eyebrow">SELL ON UNITRADE</span>
                    <h1>Create a listing</h1>
                    <p>Give your item a clear story so the right student can find it.</p>
                </div>
                <div className="listing-step">Step 1 of 1 <span>Listing details</span></div>
            </header>

            <div className="listing-layout">
                <form className="listing-form" onSubmit={handleSubmit}>
                    {error && <div className="listing-error" role="alert">{error}</div>}
                            <section className="listing-section">
                        <div className="section-title">
                            <span className="section-number">01</span>
                            <div><h2>Item details</h2><p>Start with the basics buyers look for first.</p></div>
                        </div>

                        <div className="listing-field">
                            <label htmlFor="title">Listing title</label>
                            <input type="text" className="listing-input" id="title" name="title" placeholder="e.g. Second-hand laptop" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="listing-field">
                            <label htmlFor="description">Description</label>
                            <textarea className="listing-input listing-textarea" id="description" name="description" placeholder="Describe the item's condition, features and anything a buyer should know..." value={formData.description} onChange={handleChange} required />
                        </div>

                        <div className="listing-fields-grid">
                            <div className="listing-field">
                                <label htmlFor="category">Category</label>
                                <select className="listing-input" id="category" name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="">Select category</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="books">Books</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="furniture">Furniture</option>
                                    <option value="stationery">Stationery</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="listing-field">
                                <label htmlFor="condition">Condition</label>
                                <select className="listing-input" id="condition" name="condition" value={formData.condition} onChange={handleChange} required>
                                    <option value="">Select condition</option>
                                    <option value="new">New</option>
                                    <option value="like-new">Like New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="used">Used</option>
                                </select>
                            </div>
                        </div>

                        <div className="listing-fields-grid">
                            <div className="listing-field">
                                <label htmlFor="price">Price <span>(ZAR)</span></label>
                                <input type="number" className="listing-input" id="price" name="price" placeholder="e.g. 850" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="listing-field">
                                <label htmlFor="location">Meet-up location</label>
                                <select className="listing-input" id="location" name="location" value={formData.location} onChange={handleChange} required>
                                    <option value="">Select a CPUT campus</option>
                                    <option value="Bellville Campus">Bellville Campus</option>
                                    <option value="District Six Campus">District Six Campus</option>
                                    <option value="Granger Bay Campus">Granger Bay Campus</option>
                                    <option value="Mowbray Campus">Mowbray Campus</option>
                                    <option value="Wellington Campus">Wellington Campus</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="listing-section">
                        <div className="section-title">
                            <span className="section-number">02</span>
                            <div><h2>Item photo</h2><p>Add a clear image to help your listing stand out.</p></div>
                        </div>
                        <div className="listing-field">
                            <label htmlFor="image-file">Upload from your device <span>(optional)</span></label>
                            <input
                                type="file"
                                className="listing-input listing-file-input"
                                id="image-file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {imageFileName && (
                                <div className="listing-file-selected">
                                    <span>{imageFileName}</span>
                                    <button type="button" onClick={clearUploadedImage}>Remove</button>
                                </div>
                            )}
                        </div>
                        <div className="listing-image-divider"><span>or use an image URL</span></div>
                        <div className="listing-field">
                            <label htmlFor="image">Image URL <span>(optional)</span></label>
                            <input type="url" className="listing-input" id="image" name="image" placeholder="https://example.com/image.jpg" value={imageFileName ? "" : formData.image} onChange={handleChange} disabled={Boolean(imageFileName)} />
                            {imageFileName && <small className="listing-field-help">The uploaded image will be used instead of the URL.</small>}
                        </div>
                    </section>

                    <div className="listing-actions">
                        <span>Your listing will be visible to students on your campus.</span>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Publishing...' : 'Publish listing'} <span aria-hidden="true">&#8594;</span></button>
                    </div>
                </form>

                <aside className="listing-aside">
                    <div className="listing-aside-art"><span>+</span></div>
                    <h2>Make it easy to say yes.</h2>
                    <p>Use a specific title, honest condition and a price that feels fair. Clear listings move faster.</p>
                    <div className="listing-tip"><span aria-hidden="true">&#10003;</span><p><strong>Good to know</strong><br />Meet in a public campus location.</p></div>
                </aside>
            </div>
        </div>
    );
}
