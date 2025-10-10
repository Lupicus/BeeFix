var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var FieldInsnNode = Java.type('org.objectweb.asm.tree.FieldInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'Bee': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.world.entity.animal.Bee$BeePollinateGoal'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var found2 = false
    			var fn = "canBeeUse"
    			var fn2 = "canBeeContinueToUse"
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_rainFix(obj)
    					count++
    				}
    				else if (obj.name == fn2) {
    					patch_rainFix(obj)
    					count++
    				}
    			}
    			if (count < 2)
    				asmapi.log("ERROR", "Failed to modify BeePollinateGoal: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add END dimension check
function patch_rainFix(obj) {
	var m1 = "isRaining"
	var node = asmapi.findFirstInstruction(obj, opc.INVOKEVIRTUAL)
	while (node) {
		if (node.name == m1) {
			var node2 = node.getNext()
			if (node2.getOpcode() == opc.IFEQ) {
				var op1 = new VarInsnNode(opc.ALOAD, 0)
				var op2 = new FieldInsnNode(opc.GETFIELD, "net/minecraft/world/entity/animal/Bee$BeePollinateGoal", "this$0", "Lnet/minecraft/world/entity/animal/Bee;")
				var op3 = asmapi.buildMethodCall("net/minecraft/world/entity/animal/Bee", "level", "()Lnet/minecraft/world/level/Level;", asmapi.MethodType.VIRTUAL)
				var op4 = asmapi.buildMethodCall("net/minecraft/world/level/Level", "dimension", "()Lnet/minecraft/resources/ResourceKey;", asmapi.MethodType.VIRTUAL)
				var op5 = new FieldInsnNode(opc.GETSTATIC, "net/minecraft/world/level/Level", "END", "Lnet/minecraft/resources/ResourceKey;")
				var op6 = new JumpInsnNode(opc.IF_ACMPEQ, node2.label)
				var list = asmapi.listOf(op1, op2, op3, op4, op5, op6)
				obj.instructions.insert(node2, list)
			}
			else
				asmapi.log("ERROR", "Failed to modify BeePollinateGoal: code is different")
			return
		}
		var index = obj.instructions.indexOf(node)
		node = asmapi.findFirstInstructionAfter(obj, opc.INVOKEVIRTUAL, index + 1)
	}
	asmapi.log("ERROR", "Failed to modify BeePollinateGoal: call not found")
}
