var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')

function initializeCoreMod() {
    return {
    	'TurtleEgg': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.block.TurtleEggBlock'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = asmapi.mapMethod('func_212570_a') // canTrample
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_func_212570_a(obj)
    					count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify TurtleEggBlock: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add instanceof Bee
function patch_func_212570_a(obj) {
	var desc = "net/minecraft/entity/passive/BatEntity"
	var node = asmapi.findFirstInstruction(obj, opc.INSTANCEOF)
	while (node) {
		if (node.desc == desc) {
			var node2 = node.getNext()
			if (node2.getOpcode() == opc.IFNE) {
				var op1 = new VarInsnNode(opc.ALOAD, 2)
				var op2 = new TypeInsnNode(opc.INSTANCEOF, "net/minecraft/entity/passive/BeeEntity")
				var op3 = new JumpInsnNode(opc.IFNE, node2.label)
				var list = asmapi.listOf(op1, op2, op3)
				obj.instructions.insert(node2, list)
			}
			else
				asmapi.log("ERROR", "Failed to modify TurtleEggBlock: INSTANCEOF is different")
			return;
		}
		var index = obj.instructions.indexOf(node)
		node = asmapi.findFirstInstructionAfter(obj, opc.INSTANCEOF, index + 1)
	}
	asmapi.log("ERROR", "Failed to modify TurtleEggBlock: INSTANCEOF not found")
}
