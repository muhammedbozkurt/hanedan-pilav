import json, math
d=json.load(open('../yonler_geo/istanbul-districts.json'))
LON0,LON1,LAT0,LAT1=27.9713956,29.958148,40.8027042,41.5850271
C=math.cos(math.radians((LAT0+LAT1)/2))
PAD=6
K=(1000-2*PAD)/((LON1-LON0)*C)
H=round((LAT1-LAT0)*K+2*PAD)
def P(lon,lat): return (PAD+(lon-LON0)*C*K, PAD+(LAT1-lat)*K)
def rdp(pts,eps):
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1]; dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy) or 1e-9
    imax,dmax=0,0
    for i in range(1,len(pts)-1):
        p=pts[i]; dd=abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L
        if dd>dmax: imax,dmax=i,dd
    if dmax>eps: return rdp(pts[:imax+1],eps)[:-1]+rdp(pts[imax:],eps)
    return [a,b]
def cen(r):
    A=cx=cy=0
    for (x0,y0),(x1,y1) in zip(r,r[1:]+r[:1]):
        c=x0*y1-x1*y0; A+=c; cx+=(x0+x1)*c; cy+=(y0+y1)*c
    A/=2
    return (abs(A),cx/(6*A),cy/(6*A)) if abs(A)>1e-12 else (0,r[0][0],r[0][1])
paths={}; cents={}
for ft in d['features']:
    n=ft['properties']['name']; g=ft['geometry']
    polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    segs=[]; At=Sx=Sy=0
    for poly in polys:
        A,cx,cy=cen([tuple(p[:2]) for p in poly[0]]); At+=A; Sx+=cx*A; Sy+=cy*A
        for ring in poly:
            pts=[P(*p[:2]) for p in ring]
            if pts[0]==pts[-1]: pts=pts[:-1]
            if len(pts)<3: continue
            far=max(range(len(pts)),key=lambda i:(pts[i][0]-pts[0][0])**2+(pts[i][1]-pts[0][1])**2)
            s=rdp(pts[:far+1],0.6)[:-1]+rdp(pts[far:]+[pts[0]],0.6)[:-1]
            if len(s)<3: continue
            segs.append('M'+' '.join(f'{x:.1f},{y:.1f}' for x,y in s)+'Z')
    paths[n]=''.join(segs); cents[n]=(Sx/At,Sy/At)
hx,hy=P(*cents['Sultangazi'])
out=[f'<svg class="harita-svg" viewBox="0 0 1000 {H}" aria-hidden="true" focusable="false"><g class="ilceler">']
for n in sorted(paths):
    if n=='Sultangazi': continue
    out.append(f'<path d="{paths[n]}"/>')
out.append(f'</g><path class="merkez-ilce" d="{paths["Sultangazi"]}"/></svg>')
s=''.join(out); open('map.svg','w').write(s)
print('H',H,'hq',round(hx,1),round(hy,1),'pct',round(hx/10,2),round(hy/H*100,2),'bytes',len(s))
for lab,(lon,lat) in {'karadeniz':(28.80,41.47),'marmara':(28.62,40.90)}.items():
    x,y=P(lon,lat); print(lab,round(x/10,2),round(y/H*100,2))
