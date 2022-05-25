var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')
var LdcInsnNode = Java.type('org.objectweb.asm.tree.LdcInsnNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'RandomPos': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.entity.ai.RandomPositionGenerator'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = asmapi.mapMethod('func_226343_a_') // generateRandomDirectionWithinRadians
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_func_226343_a_(obj)
    					count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify RandomPos: Method not found")
    			return classNode;
    		}
    	}
    }
}

function add_half(obj, node) {
	var op1 = new LdcInsnNode(0.5)
	var op2 = new InsnNode(opc.DADD)
	var list = asmapi.listOf(op1, op2)
	obj.instructions.insert(node, list)
}

// [MC-206401] add 0.5 to x and z when creating BlockPos
function patch_func_226343_a_(obj) {
	var count = 0
	var node = asmapi.findFirstInstruction(obj, opc.NEW)
	while (node) {
		if (node.desc.endsWith('BlockPos')) {
			var node2 = node.getNext().getNext()
			var node3 = node2.getNext().getNext().getNext()
			if (node2.getOpcode() == opc.DLOAD && node3.getOpcode() == opc.DLOAD) {
				add_half(obj, node2)
				add_half(obj, node3)
				count++
			}
		}
		var index = obj.instructions.indexOf(node)
		node = asmapi.findFirstInstructionAfter(obj, opc.NEW, index + 1)
	}
	if (count == 0)
		asmapi.log("ERROR", "Failed to modify RandomPos: NEW/DLOAD not found")
}
