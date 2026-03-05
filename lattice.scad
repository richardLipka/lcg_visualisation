/*
    LCG Lattice Visualizer for 3D Printing
    --------------------------------------
    This model visualizes the lattice structure of a Linear Congruential Generator (LCG).
    It demonstrates the "Planes Problem" (Marsaglia's Theorem) where pseudo-random
    points fall onto a small number of hyperplanes.
    
    Suitable for MakerWorld / Bambu Lab Parametric Model Maker.
*/

/* [Generator Parameters] */

// The multiplier (a). Try 65539 for RANDU (bad) or 1103515245 for glibc (good).
multiplier = 65539; // [0:2147483647]

// The increment (c).
increment = 0; // [0:2147483647]

// The modulus (m). Usually a power of 2.
modulus = 2147483648; // [2:4294967296]

// Initial seed value.
seed = 1; // [0:2147483647]

// Number of points to visualize.
num_points = 300; // [10:1000]

/* [Model Settings] */

// Size of the bounding box in mm.
box_size = 100; // [20:200]

// Diameter of each point (sphere) in mm.
point_size = 3; // [1:10]

// Thickness of the bounding box frame in mm.
frame_thickness = 1.5; // [0.5:5]

// Resolution of the spheres.
$fn = 12; // [6:32]

/* [Visualization] */

// Show the bounding box frame.
show_frame = true;

// --- Implementation ---

// Helper function to generate the LCG sequence
// Note: OpenSCAD recursion is used to simulate the generator state
function lcg_sequence(n, s, acc=[]) = 
    n <= 0 ? acc : 
    let(next_s = (multiplier * s + increment) % modulus)
    lcg_sequence(n - 1, next_s, concat(acc, [next_s / modulus]));

// Generate the raw values (3 per point)
values = lcg_sequence(num_points * 3, seed);

// Render the points
module draw_points() {
    for (i = [0 : num_points - 1]) {
        let(
            x = values[i * 3],
            y = values[i * 3 + 1],
            z = values[i * 3 + 2]
        )
        translate([x * box_size, y * box_size, z * box_size])
        sphere(d = point_size);
    }
}

// Render the bounding box frame
module draw_frame() {
    if (show_frame) {
        color("gray", 0.5)
        difference() {
            // Outer cube
            translate([-frame_thickness/2, -frame_thickness/2, -frame_thickness/2])
            cube(box_size + frame_thickness);
            
            // Inner cutout
            translate([frame_thickness/2, -frame_thickness, frame_thickness/2])
            cube([box_size - frame_thickness, box_size + 2*frame_thickness, box_size - frame_thickness]);
            
            translate([-frame_thickness, frame_thickness/2, frame_thickness/2])
            cube([box_size + 2*frame_thickness, box_size - frame_thickness, box_size - frame_thickness]);
            
            translate([frame_thickness/2, frame_thickness/2, -frame_thickness])
            cube([box_size - frame_thickness, box_size - frame_thickness, box_size + 2*frame_thickness]);
        }
    }
}

// Main Assembly
union() {
    draw_points();
    draw_frame();
}

// --- Instructions for MakerWorld ---
// 1. Upload this .scad file.
// 2. The parameters in the [Generator Parameters] and [Model Settings] sections 
//    will be automatically detected as GUI sliders/inputs.
// 3. Users can visualize different LCGs and print their lattice structures.
