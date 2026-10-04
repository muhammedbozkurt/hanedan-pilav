import sys
from PIL import Image
src,dst,y0,y1=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
im=Image.open(src); w,h=im.size
im.crop((0,y0,w,min(y1,h))).save(dst); print(w,h)
