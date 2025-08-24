import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function PhotographerPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      await axios.post('https://booking-backend-1-u8m4.onrender.com/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Post created!');
      setTitle('');
      setDescription('');
      setImage(null);
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} required />
      <button type="submit">Post</button>
    </form>
  );
}

export default PhotographerPost;