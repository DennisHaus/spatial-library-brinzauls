window.LOCATION_CONFIG = {
  pageTitle: "Spatial Library Brinzauls",

  metaDescription:
    "Cloud optimized point cloud viewer for Brienz/Brinzauls scans.",

  brandEyebrow:
    "© ETH ZURICH",

  brandTitle: `
    SPATIAL<br>
    LIBRARY<br>
    BRINZAULS
  `,

  brandSubtitle: `
  copc viewer & point cloud model interface | for collecting, storing and
  visualizing spatial recordings and spatial visions of Brienz/Brinzauls
  during the Seminarweek 2026  |
    beta version
    <br><br>
    See all Places <a
      class="subtitle-link"
      href="https://dennishaus.github.io/overview"
      target="_blank"
      rel="noopener"
    >
      here
    </a> |
    Viewer inspired by
    <a
      class="subtitle-link"
      href="https://kyotodesignlab.github.io/campus-garden"
      target="_blank"
      rel="noopener"
    >
      Campus Garden XR
    </a>
    , Kyoto Design Lab
  `,

  startView: {
  position: [607.803, -614.757, 1336.936],
  target: [5.885, -75.285, 1176.3]
},

  navigationMode: "fly",

  uploadUrl:
    "https://github.com/DennisHaus/spatial-library-brinzauls/upload/main/scans",

  readmeTitle: "Spatial Library - Read Me",

  catalogUrl: "./catalog.json",

  scanPathPrefix: "scans/",

  /*
    Keep this false when catalog.json contains relative paths,
    for example: scans/scan-01.copc.laz
  */
  useRawBaseForPaths: false,

  rawBaseUrl:
    "https://raw.githubusercontent.com/DennisHaus/pointcloud_viewer/main",

  downloadPassword: "Voser",

  /*
    Usage counters in the Read Me (downloads, renders, documents, visits).
    The counts are stored on a free counter service so that every visitor
    sees the same totals. Use a unique namespace per location.
  */
  usageStats: {
    enabled: true,
    apiBase: "https://abacus.jasoncameron.dev",
    namespace: "spatial-library-brinzauls"
  },

  readmeHtml: `
    <section>
      <h3>Overview</h3>

      <p>
        Spatial Library Brinzauls is a point-cloud viewer for loading,
        visualizing, inspecting and comparing COPC LAZ scans, together with
        images, videos and audio recordings of the place.
      </p>

      <p>
        Select a scan from the model library to load it into the viewer.
        Several scans can be loaded and displayed at the same time.
        Registered users can upload and download models.
        Sections can be visualized and images exported.
      </p>
    </section>

    <section>
      <h3>Compatible file formats</h3>

      <ul>
        <li>
          <strong>Point cloud:</strong>
          .copc.laz
        </li>

        <li>
          <strong>Video:</strong>
          .mp4 | .mov
        </li>

        <li>
          <strong>Images:</strong>
          .png | .jpg
        </li>

        <li>
          <strong>Audio:</strong>
          .mp3 | .wav
        </li>
      </ul>

      <p>
        Images, videos and audio files open in a small window that can be
        moved by dragging its title bar. Image and video windows can be
        resized at their corners.
      </p>
    </section>

    <section>
      <h3>Navigation</h3>

      <ul>
        <li>
          <strong>Left mouse button + drag:</strong>
          Rotate the view.
        </li>

        <li>
          <strong>Right mouse button + drag:</strong>
          Pan the view.
        </li>

        <li>
          <strong>Mouse wheel:</strong>
          Zoom in and out.
        </li>

        <li>
          <strong>W / S or Arrow Up / Down:</strong>
          Move forward and backward.
        </li>

        <li>
          <strong>A / D or Arrow Left / Right:</strong>
          Move left and right.
        </li>

        <li>
          <strong>E / C:</strong>
          Move up and down.
        </li>

        <li>
          <strong>. and , :</strong>
          Increase or decrease the movement speed.
        </li>
      </ul>
    </section>

    <section>
      <h3>Viewer toolbar</h3>

      <p>
        The toolbar at the bottom of the viewer contains, from left to right:
      </p>

      <ul>
        <li>
          <strong>Focus on all visible scans:</strong>
          Zooms out so that every visible scan fits into the view.
        </li>

        <li>
          <strong>Focus on selected scan:</strong>
          Zooms to the scan that is currently selected in the library.
        </li>

        <li>
          <strong>Orbit / Fly (key O):</strong>
          Orbit rotates the view around a center point.
          Fly rotates the view around the camera itself, like turning
          your head.
        </li>

        <li>
          <strong>Perspective / Orthographic:</strong>
          Perspective shows the scan with depth, as the eye sees it.
          Orthographic removes the perspective distortion, so parallel
          lines stay parallel, as in a plan or elevation drawing.
        </li>

        <li>
          <strong>Download:</strong>
          Downloads the selected scan as a .copc.laz file.
          A password is required.
        </li>
      </ul>
    </section>

    <section>
      <h3>Model library</h3>

      <ul>
        <li>Click a scan name to select it.</li>
        <li>Click the visibility symbol to show or hide a scan.</li>
        <li>Use the refresh button to reload the scan catalog.</li>
        <li>Use the arrow button to open or close the library.</li>
      </ul>
    </section>

    <section>
      <h3>Inspector</h3>

      <p>
        Open the inspector with the bar at the bottom right. All settings
        apply to the scan that is currently selected in the library.
      </p>

      <ul>
        <li>
          <strong>Scan information:</strong>
          Shows the file format, the number of loaded points and the
          file size of the selected scan.
        </li>

        <li>
          <strong>Point display:</strong>
          <em>Depth-sized</em> draws points larger when they are close to
          the camera and smaller when they are far away, so surfaces look
          closed. <em>Single pixels</em> draws every point as one pixel,
          which shows the raw density of the scan.
        </li>

        <li>
          <strong>Color mode:</strong>
          <em>RGB</em> shows the colors recorded during the scan.
          <em>Elevation</em> colors the points by height.
          <em>Intensity</em> shows how strongly each point reflected the
          laser. <em>Classification</em> colors points by category, such as
          ground, vegetation or buildings, if the file contains this
          information. <em>Return number</em> shows which laser return a
          point came from, which helps to tell vegetation from solid
          surfaces.
        </li>

        <li>
          <strong>Point size:</strong>
          Makes the points larger or smaller. Only applies in depth-sized
          mode.
        </li>

        <li>
          <strong>Opacity:</strong>
          Makes the points more or less transparent, for example to see
          one scan through another.
        </li>

        <li>
          <strong>Point budget:</strong>
          The maximum number of points the viewer loads at the same time.
          A higher budget shows more detail but needs a faster computer.
          Lower it if the viewer becomes slow.
        </li>

        <li>
          <strong>Bounds:</strong>
          Shows the extent of the selected scan in X, Y and Z coordinates.
        </li>
      </ul>
    </section>

    <section>
      <h3>Sections</h3>

      <p>
        A section cuts a thin slice out of the selected scan and hides
        everything else.
      </p>

      <ul>
        <li>
          <strong>Section type:</strong>
          <em>Horizontal section</em> cuts at a certain height, like a
          floor plan. <em>Vertical section</em> cuts upright through the
          scan, like a section drawing.
        </li>

        <li>
          <strong>Direction:</strong>
          Only for vertical sections. Rotates the cutting line around the
          vertical axis, from 0° to 179°.
        </li>

        <li>
          <strong>Position:</strong>
          Moves the slice through the scan.
        </li>

        <li>
          <strong>Thickness:</strong>
          Sets how thick the slice is. A thin slice gives a sharp line,
          a thicker slice shows more context.
        </li>

        <li>
          <strong>Apply / Clear:</strong>
          Apply creates the section. Once it is applied, changes to
          direction, position and thickness update it directly.
          Clear removes the section and shows the full scan again.
        </li>
      </ul>
    </section>

    <section>
      <h3>PNG export</h3>

      <p>
        Export PNG at the top right saves the current view as an image.
      </p>

      <ul>
        <li>
          <strong>Resolution (1x to 5x):</strong>
          The image is rendered at a multiple of the current viewer size.
          1x matches what you see on screen, 5x is five times wider and
          higher, for printing or large posters. Higher resolutions take
          a few seconds to render.
        </li>

        <li>
          <strong>Transparent background:</strong>
          The background is left out, so the points can be placed directly
          on plans, collages or layouts.
        </li>

        <li>
          <strong>Sections:</strong>
          When a section is active, the image is cropped to the visible
          points of the slice.
        </li>

        <li>
          <strong>File name:</strong>
          The file is named after the selected scan, the resolution and
          the image size, for example scan-name_3x_4800x2400.png.
        </li>

        <li>
          <strong>Tip:</strong>
          For plan and section drawings, combine a section with the
          orthographic view and single-pixel or depth-sized points.
        </li>
      </ul>
    </section>

    <section>
      <h3>Impressum</h3>

      <p>
        © ETH Zürich, developed at Professur Voser, Institute for Landscape
        and Urban Studies, ETH Zürich.
      </p>

      <p>
        Contact information:<br>
        <strong>Professur Voser</strong><br>
        c/o Dennis Häusler<br>
        Institute for Landscape and Urban Studies<br>
        ETH Zürich, Switzerland<br>
        haeusler@arch.ethz.ch
      </p>
    </section>
  `
};
