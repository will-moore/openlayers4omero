from omero.gateway import BlitzGateway
from omeroweb.webgateway.marshal import shapeMarshal
from omero.model import RoiI, RectangleI, LengthI
from omero.rtypes import rint, rdouble
from omero.model.enums import UnitsLength
import json

class App:
    _connection = None
    
    def __init__(self, conn=None):
        if conn is None:
            raise Exception("Not Connected")
        self._connection = conn
    
    def convertDictToArray(self, dic):
        if dic is None or type(dic) is not dict:
            return None
        ret = None
        try:
            return map(lambda x: 1 / x, sorted(dic.values()))
        except Exception as ex:
            print ex
            ret = None
 
        return ret
    
    def listDatasets(self, datasetId=None):
        if datasetId is not None:
            datasets = [self._connection.getObject('Dataset', datasetId)]
        else:
            datasets = self._connection.getObjects('Dataset')
        ret = []
        for dataset in datasets:
            tmp_images = []
            for image in dataset.listChildren():
                tmp_images.append(
                                  { "name" : image.getName(), "id" : image.getId()
                                   ,"sizeX" : image.getSizeX(), "sizeY" : image.getSizeY()
                                   ,"sizeZ" : image.getSizeZ(), "sizeT" : image.getSizeT()
                                   ,"sizeC" : image.getSizeC()
                                   ,"zoomLevelScaling" : self.convertDictToArray(image.getZoomLevelScaling())
                                   ,"isGreyScale" : image.isGreyscaleRenderingModel()
                                   , "channelLabels" : image.getChannelLabels()
                                   ,"roiCount" : image.getROICount(), "requiresPixelsPyramid" : image.requiresPixelsPyramid()
                                   })
            if tmp_images:
                ret.append({"name" : dataset.getName(), "id" : dataset.getId(), "images" : tmp_images })
                
        if not ret:
            return {'datasets' : []}
        
        return {"datasets": ret}
    
    def getImage0(self, imageid):
        try:
            img = self._connection.getObject("Image", imageid)
            return img
        except Exception as e:
            print e
            return None

    def get_rois(self, imageId):
        try:
            rois = []
            roiService = self._connection.getRoiService()
            result = roiService.findByImage(long(imageId), None, self._connection.SERVICE_OPTS)
        
            for r in result.rois:
                roi = {}
                roi['id'] = r.getId().getValue()
                # go through all the shapes of the ROI
                shapes = []
                for s in r.copyShapes():
                    if s is None:   # seems possible in some situations
                        continue
                    shapes.append(shapeMarshal(s))
                # sort shapes by Z, then T.
                shapes.sort(
                    key=lambda x: "%03d%03d"
                    % (x.get('theZ', -1), x.get('theT', -1)))
                roi['shapes'] = shapes
                rois.append(roi)
        
            rois.sort(key=lambda x: x['id'])
        
            return rois
        except Exception as e:
            print e
            return None

    def addRoi(self, request, imageid):
        img = self.getImage0(imageid)
        if img is None:
            return None

        data = json.loads(request.body)
        shapes = data['shapes']
        x = y = l = z = t = -1
        for s in shapes:
            for k in s:
                val = s[k]
                if k == "x":
                    x = int(val)
                elif k == "y":
                    y = int(val)
                elif k == "width":
                    l = int(val)
                elif k == "theZ":
                    z = int(val)
                elif k == "theT":
                    t = int(val)
                elif k == "fillColorAsInt":
                    fill = int(val)
                elif k == "strokeColorAsInt":
                    stroke = int(val)
                elif k == "strokeWidth":
                    strokeWidth = int(val)
        
        if (x < 0 or y < 0 or z < 0 or t < 0 or l <= 0):
            return None
        
        updateService = self._connection.getUpdateService()
        roi = RoiI()
        roi.setImage(img._obj)
        rect = RectangleI()
        rect.x = rdouble(x)
        rect.y = rdouble(y)
        rect.width = rdouble(l)
        rect.height = rdouble(l)
        rect.theZ = rint(z)
        rect.theT = rint(t)
        rect.setFillColor(rint(fill))
        strokeLen = LengthI()
        strokeLen.setValue(strokeWidth)
        strokeLen.setUnit(UnitsLength.PIXEL)
        rect.setStrokeWidth(strokeLen)
        rect.setStrokeColor(rint(stroke))
        roi.addShape(rect)
        
        if (updateService.saveAndReturnObject(roi) is None):
            return None
        return self.get_rois(imageid) 
    def equals(self, one_float, second_float, tolerance = 0.00000001):
        if type(one_float) is not float or type(second_float) is not float:
            return False
        diff = abs(one_float-second_float)
        if diff > tolerance:
            return False
        return True

    def getThumbnail(self, imageid):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        try:
            return img.getThumbnail()
        except Exception as e:
            print e
            return None

    def getImage(self, imageid, z=0, t=0, c=0, tile=None, l=None):
        img = self.getImage0(imageid)
        if img is None:
            return None
        
        try:
            c = int(c)
            if c > 0:
                img.setActiveChannels([c])
            if tile is None: 
                return img.renderJpeg(z, t)

            res = img.getZoomLevelScaling()
            
            if res is None:
                l = None
            else:
                levels = len(res) - 1
                if l is not None:
                    if levels > 0:
                        l = int(l)
                        if l < 0 or l > levels:
                            print 'resolution level out of range'
                    l=levels-l

            offX = int(tile['x']) * int(tile['w'])
            offY = int(tile['y']) * int(tile['h'])
   
            return img.renderJpegRegion(z, t, offX, offY, tile['w'],tile['h'], l);
        except Exception as e:
            print e
            return None