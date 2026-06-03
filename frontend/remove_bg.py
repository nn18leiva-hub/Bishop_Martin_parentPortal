import sys
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # Using a tolerance to catch near-white pixels
    for item in datas:
        # Check if the pixel is close to white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # Fully transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input> <output>")
        sys.exit(1)
    make_transparent(sys.argv[1], sys.argv[2])
