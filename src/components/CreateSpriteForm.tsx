export default function CreateSpriteForm() {
  return (
    <div>
      <h1>Create Sprite</h1>
      <form>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" />
        <label htmlFor="width">Width:</label>
        <input type="number" id="width" name="width" />
        <label htmlFor="height">Height:</label>
        <input type="number" id="height" name="height" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
