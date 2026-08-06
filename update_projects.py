import re

with open('projects-component.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Add dimensions to projects array
replacements = {
    '"assets/global_grid.png"': '"assets/global_grid.png",\n    imgWidth: 1024,\n    imgHeight: 436',
    '"assets/smart_delivery.png"': '"assets/smart_delivery.png",\n    imgWidth: 1024,\n    imgHeight: 432',
    '"assets/food_ordering.png"': '"assets/food_ordering.png",\n    imgWidth: 1903,\n    imgHeight: 950'
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Update Card destructured props
code = code.replace(
"""  image,
  bullets,""",
"""  image,
  imgWidth,
  imgHeight,
  bullets,""")

# Update img tag rendering
img_tag = """              e("img", {
                src: image,
                alt: name,
                className: "card-screenshot",
                onError: handleImageError,
              })"""

new_img_tag = """              e("img", {
                src: image,
                alt: name,
                width: imgWidth,
                height: imgHeight,
                className: "card-screenshot",
                onError: handleImageError,
              })"""

code = code.replace(img_tag, new_img_tag)

# Also update the source tag for picture? Source tag can have width and height, but img tag is enough for layout shift.

with open('projects-component.js', 'w', encoding='utf-8') as f:
    f.write(code)
