"""A word tag on a thumbnail, in the channel's style: mustard Rubik ExtraBold (800) on an ink plate with a paper edge,
tilted like the film's paper tags. Keep it off faces and out of the bottom-right corner (YouTube's duration badge).

    python thumb_tag.py <in.jpg> <out.jpg> "DAY 12" <Rubik[wght].ttf> [top-left|bottom-left]

Rubik is OFL, from https://github.com/google/fonts/tree/main/ofl/rubik (the same face the idents load).
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, out, text, font_path = sys.argv[1:5]
where = sys.argv[5] if len(sys.argv) > 5 else "top-left"   # or bottom-left; never the bottom-right (duration badge)
INK, MUSTARD, PAPER = (35, 37, 43), (242, 182, 50), (243, 233, 215)
img = Image.open(src).convert("RGB")
font = ImageFont.truetype(font_path, 132)
font.set_variation_by_axes([800])
l, t, r, b = font.getbbox(text)
pad_x, pad_y = 38, 26
w, h = r - l + 2 * pad_x, b - t + 2 * pad_y
tag = Image.new("RGBA", (w + 16, h + 16), (0, 0, 0, 0))
d = ImageDraw.Draw(tag)
d.rounded_rectangle((8, 8, 8 + w, 8 + h), radius=18, fill=INK + (255,), outline=PAPER + (255,), width=5)
d.text((8 + pad_x - l, 8 + pad_y - t), text, font=font, fill=MUSTARD)
tag = tag.rotate(-4, resample=Image.BICUBIC, expand=True)
shadow = Image.new("RGBA", tag.size, (0, 0, 0, 0))
shadow.paste((0, 0, 0, 110), mask=tag.split()[3])
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
x, y = (40, 34) if where == "top-left" else (40, img.height - tag.height - 40)
img.paste(shadow, (x + 8, y + 12), shadow)
img.paste(tag, (x, y), tag)
img.save(out, quality=92)
print(out, img.size)
