# Image Crop Feature Setup

## Installation

To enable the image cropping functionality, you need to install the `react-image-crop` package:

```bash
npm install react-image-crop
```

Or if you're using yarn:

```bash
yarn add react-image-crop
```

## What's Been Added

### 1. Image Cropper Component
- **Location**: `src/components/ui/image-cropper.tsx`
- A reusable modal component for cropping images
- Supports custom aspect ratios
- Shows loading state during processing

### 2. Integration in Forms
The image cropper has been integrated into:
- **Event Forms**:
  - `src/components/custom/contentManagment/add-event-form.tsx`
  - `src/components/custom/contentManagment/edit-event-form.tsx`
- **Promotion Forms**:
  - `src/components/custom/contentManagment/add-promotion-form.tsx` (handles both add and edit modes)

### 3. Features

#### Event Forms:
- **Banner Image Cropping**: 16:9 aspect ratio (1920x1080px recommended)
- **Speaker Image Cropping**: 1:1 aspect ratio (400x400px recommended)
- **Attachment Image Cropping**: 16:9 aspect ratio (1920x1080px recommended)
- **Certificate Template Cropping**: 2:1 aspect ratio (1200x600px recommended)

#### Promotion Forms:
- **Banner Image Cropping**: 16:9 aspect ratio (1920x1080px recommended)

## How It Works

1. When a user selects an image file, the cropper modal opens automatically
2. User can adjust the crop area manually
3. Clicking "Apply Crop" processes the image and uploads the cropped version
4. The cropped image is then displayed in the form

## Usage

### Event Forms
The cropper is automatically triggered when:
- Uploading a banner image (16:9 aspect ratio)
- Uploading a speaker image (1:1 aspect ratio)
- Uploading an attachment image (16:9 aspect ratio)
- Uploading a certificate template (2:1 aspect ratio)

### Promotion Forms
The cropper is automatically triggered when:
- Uploading a banner/poster image (16:9 aspect ratio)

No additional configuration needed - just install the package and it's ready to use!
